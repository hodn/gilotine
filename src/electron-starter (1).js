const { Parser } = require('json2csv');
const fs = require('fs');
// Module to include electron
const electron = require('electron');
// Module for file paths
const path = require('path');
// Module for hot reload 
//require('electron-reload')(__dirname, { electron: require('${__dirname}/../../node_modules/electron') })
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({webPreferences: {
        nodeIntegration: true
      }});
    mainWindow.maximize();
    // and load the index.html of the app.
    mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.setMenuBarVisibility(false)
    //mainWindow.loadURL('http://localhost:3000');
    
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
    
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        
        // If the windows is closed while recording, save the CSV record and clear the array
        if(recordingON === true){
            saveRecord(csvRecord)
            csvRecord = []
        }
        
        app.quit()
        
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    electron.dialog.showErrorBox(error.message, error.message + ". Please, check if the settings are correct.")
    console.log(error);
  })
process.on('uncaughtException', error => {
    electron.dialog.showErrorBox(error.message, "App has encountered an error - " + error.message)
  })

//////////////////////////////////////// Parsing data from COM port ////////////////////////////////////////

// Delimiter init for data packets
const Delimiter = require('@serialport/parser-delimiter')
// Module for IPC with Renderer
const ipcMain = electron.ipcMain
// SerialPort init
const SerialPort = require('serialport')

// State of recording
let recordingON = false

// Data to be saved into the CSV
let csvRecord = []

// Default settings - CSV saving directory and COM PORT
let defaultDir = ""
let defaultCOM = ""

// Loads user settings file if exists or creates new one with default values
if (fs.existsSync("user-settings.txt")){
    
    fs.readFile("user-settings.txt", {encoding: 'utf-8'}, function(err,data){
        if (!err) {
            const set = data.split(",")
            defaultDir = set[1]
            defaultCOM = set[0]
            saveSettings(defaultCOM, defaultDir)
        } else {
            electron.dialog.showErrorBox(err.message, "App has encountered an error - " + err.message)
        }
    })
    
}
else {
    defaultDir = app.getPath('documents')
    saveSettings(defaultCOM, defaultDir)
}

ipcMain.on('change-dir', (event, arg) => {
    
    electron.dialog.showOpenDialog({
        properties: ["openDirectory"],
    }, function (files) {
        if (files !== undefined) {
            defaultDir = files.toString()
            event.sender.send('dir-changed', defaultDir)
            saveSettings(defaultCOM, defaultDir)
        }

    })

})

ipcMain.on('change-com', (event, arg) => {

    defaultCOM = arg
    saveSettings(defaultCOM, defaultDir)
})

ipcMain.on('settings-info', (event, arg) => {
    event.sender.send('settings-loaded', {dir: defaultDir, com: defaultCOM})
})

// List available ports on event from Renderer
ipcMain.on('list-ports', (event, arg) => {
    SerialPort.list().then(
    ports => ports.forEach(function(port) {
    event.sender.send('ports-listed', port.comName)
  }),
    err => console.error(err),
)
})

// Change the state of recording boolean. If switched from true to false, save the data to CSV and clear the array
ipcMain.on('recording', (event, arg) => {
  recordingON = arg
  if (arg === false){
      saveRecord(csvRecord)
      csvRecord = []
  }
  })

// On clear to send - start parsing data

ipcMain.on('clear-to-send', (event, arg) => {
        
        // Port init from user settings
            let port = new SerialPort(defaultCOM, {
            baudRate: 230400
        })

        // Pipe init and delimiter settings  
        const parser = port.pipe(new Delimiter({ delimiter: '\n' }))
        
        const ch1Buffer = []
        const ch2Buffer = []
        
        const refreshRate = 40
        
        let tare_1 = 0
        let tare_2 = 0
        
        ipcMain.on('tare', (event, arg) => {
            switch(arg.value) {
                case 1:
                tare_1 = arg.ch1 + tare_1
                break;
                case 2:
                tare_2 = arg.ch2 + tare_2
                break;
                default:
                return
            }})
        
        // Switches the port into "flowing mode"
        parser.on('data', function(data) {

                // Raw packets are parsed into JSON object
                const channelData = rawDataParser(data)
                const tared_1 = channelData.ch1 - tare_1
                const tared_2 = channelData.ch2 - tare_2
                
                ch1Buffer.push(tared_1)
                ch2Buffer.push(tared_2)

                if(recordingON){
                    const csvSet = {
                        'Time': new Date().toLocaleTimeString(), 
                        'Force [N]': localeFormat(tared_1 * 2.74676, 0),
                        'Distance [mm]': localeFormat(tared_2 * 0.005, 3)
                        }
                
                    csvRecord.push(csvSet)
                }
                
                try {
                    event.sender.send("rt-data", {time: Date.now(), ch1: tared_1, ch2: tared_2})
                } catch(e) {
                    console.log(e)
                }
            
                
                if (ch1Buffer.length > refreshRate) {
                    const ch1 = ch1Buffer[ch1Buffer.length-1]
                    const ch2 = ch2Buffer[ch2Buffer.length-1]
                    
                    event.sender.send("agg-data", {ch1: ch1, ch2: ch2})

                    ch1Buffer.splice(0, refreshRate)
                    ch2Buffer.splice(0, refreshRate)
                }
                    
            
    }); 
})

// Dividing the original packet into EZ24 packets and converting AD to units
function rawDataParser(data){

    const dataString = data.toString().split(",")
    const channel_1 = parseInt(dataString[0]) 
    const channel_2 = parseInt(dataString[1])
    
    return {ch1: channel_1, ch2: channel_2}
}

// Saving the record
function saveRecord(record){
    
    const fileDate = new Date().toISOString()
    const filename = fileDate.split("T")[0] + "_" + new Date().getHours() + new Date().getMinutes() + new Date().getSeconds()
    let savePath = path.join(defaultDir, filename + ".csv")

    const fields = (Object.keys(record[0]))
    const delimiter = ";"
        const json2csvParser = new Parser({ fields, delimiter })
        const csvOut = json2csvParser.parse(record)
        
        fs.writeFile(savePath, csvOut, function (err) {
            
            if (err) throw err; 
        
        })
       

}

function saveSettings(com, dir){
    const settings = com.toString() + "," + dir.toString()
    fs.writeFile("user-settings.txt", settings, function (err) {
            
        if (err) throw err; 
    
    })
}

function localeFormat(number, decimals){
    return parseFloat(number.toFixed(decimals)).toLocaleString()
}