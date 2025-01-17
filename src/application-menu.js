const { app, BrowserWindow, dialog, Menu, ipcRenderer, webContents, ipcMain } = require('electron');
const main = require('electron-reload');
const mainProcess = require('./index.js');
const remote = require('electron').remote
const path = require('path');
const openAboutWindow = require('about-window').default;

/*
   * ==================================================
   *   This function creates the menu for the Svelte Storm app
   *   
   * ==================================================
*/

// const createApplicationMenu = (app) => {
const createApplicationMenu = () => {
  const hasOneOrMoreWindows = !!BrowserWindow.getAllWindows().length;
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const hasFilePath = !!(focusedWindow && focusedWindow.getRepresentedFilename());

  const template = [
    
    {
      label: 'File',
      submenu: [
        {
          label: 'Create Project',
          accelerator: 'CommandOrControl+P',
          click(item, focusedWindow) {
            
            if (focusedWindow) {
              return mainProcess.createProjectFromUser(focusedWindow);
            }
    
            const newWindow = mainProcess.createWindow();
    
            newWindow.on('show', () => {
              mainProcess.createProjectFromUser(newWindow);
            });
          },
        },
        {
          label: 'New Window',
          accelerator: 'CommandOrControl+N',
          click() {
            mainProcess.createWindow();
          }
        },
        {
          label: 'Open File',
          accelerator: 'CommandOrControl+O',
          click(item, focusedWindow) {
            
            if (focusedWindow) {
              return mainProcess.getFileFromUser(focusedWindow);
            }

            const newWindow = mainProcess.createWindow();

            newWindow.on('show', () => {
              mainProcess.getFileFromUser(newWindow);
            });
          },
        },
        {
            label: 'Open Folder',
            accelerator: 'CommandOrControl+F',
            click: (item, focusedWindow) => {
              
              if (focusedWindow) {
                mainProcess.getFolderFromUser(focusedWindow);
                return;
              }
  
              const newWindow = mainProcess.createWindow();
  
              newWindow.on('show', () => {
                mainProcess.getFolderFromUser(newWindow);      
              });
            },
          },
        {
          label: 'Save File',
          accelerator: 'CommandOrControl+S',
          enabled: hasOneOrMoreWindows,
          click(item, focusedWindow) {
            if (!focusedWindow) {
              return dialog.showErrorBox(
                'Cannot Save or Export',
                'There is currently no active document to save or export.'
              );
            } else {
              focusedWindow.webContents.send('save-markdown');
              mainProcess.saveFile(focusedWindow);
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Show File',
          enabled: hasFilePath,
          click(item, focusedWindow) {
            if (!focusedWindow) {
              return dialog.showErrorBox(
                'Cannot Show File\'s Location',
                'There is currently no active document show.'
              );
            }
            focusedWindow.webContents.send('show-file');
          },
        },
        {
          label: 'Open in Default Application',
          enabled: hasFilePath,
          click(item, focusedWindow) {
            if (!focusedWindow) {
              return dialog.showErrorBox(
                'Cannot Open File in Default Application',
                'There is currently no active document to open.'
              );
            }
            focusedWindow.webContents.send('open-in-default');
          },
        },
        {
          label: 'Open Browser Window',
          click(){
            mainProcess.openBrowserWindow();
          }
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'CommandOrControl+Z',
          role: 'undo',
        },
        {
          label: 'Redo',
          accelerator: 'Shift+CommandOrControl+Z',
          role: 'redo',
        },
        { type: 'separator' },
        {
          label: 'Cut',
          accelerator: 'CommandOrControl+X',
          role: 'cut',
        },
        {
          label: 'Copy',
          accelerator: 'CommandOrControl+C',
          role: 'copy',
        },
        {
          label: 'Paste',
          accelerator: 'CommandOrControl+V',
          role: 'paste',
        },
        {
          label: 'Select All',
          accelerator: 'CommandOrControl+A',
          role: 'selectAll',
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CommandorControl+]',
          role: 'zoomIn'
        },
        {
          label: 'Zoom Out',
          accelerator: 'CommandorControl+[',
          role: 'zoomOut'
        },
        {
          label: 'Reset Zoom',
          accelerator: 'Command+0',
          role: 'resetZoom'
        }
      ]
    },

    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CommandOrControl+M',
          role: 'minimize',
        },
        {
          label: 'Close',
          accelerator: 'CommandOrControl+W',
          role: 'close',
        },
      ],
    },
      {
      label: 'Help',
      role: 'help',
      submenu: [
        {
          label: 'Visit the SvelteStorm Website',
          click(focusedWindow) {
            if(focusedWindow) require('electron').shell.openExternal('https://svelte-storm.com/')
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'CommandOrControl+D',
          click(item, focusedWindow) {
            if (focusedWindow) focusedWindow.webContents.toggleDevTools();
          }
        },
        { type: 'separator' },
        {
            label: 'About SvelteStorm',
            click: () => 
                openAboutWindow({
                    icon_path: path.resolve(__dirname,'../public/img/SvelteStorm4Logos/SvelteStorm4Logo10x64.png'),
                    use_version_info: [
                        ['Version Number', '4.0.0'],
                    ],
                    description: 'World\'s First Dedicated Svelte IDE.\nVersion 4.0.0 now includes a Time Travel Debugging tool.\n\nThis applicationuses Open Source components. You can find the source code oftheir open source projects along with license informationbelow. We acknowledge and are grateful to these developersfor their contributions to open source.\n\nProject: Delorean https://github.com/oslabs-beta/DeLorean\nCopyright (c) 2022 OSLabs Beta\n\nLicense (MIT) https://github.com/oslabs-betaDeLorean/blob/main/LICENSE'
                })
        },
        {
            role: 'quit',
        },
      ],
    }
  ];


  if (process.platform === 'darwin') {
    const name = 'SvelteStorm 4.0';
    template.unshift({
      label: name,
      submenu: [
        {
          label: `About ${name}`,
          role: 'about',
        },
        { type: 'separator' },
        {
          label: 'Services',
          role: 'services',
          submenu: [],
        },
        { type: 'separator' },
        {
          label: `Hide ${name}`,
          accelerator: 'Command+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Alt+H',
          role: 'hideothers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        { type: 'separator' },
        {
          label: `Quit ${name}`,
          accelerator: 'Command+Q',
          click() { app.quit(); },
        },
      ],
    });

    const windowMenu = template.find(item => item.label === 'Window');
    windowMenu.role = 'window';
    windowMenu.submenu.push({ 
      type: 'separator' },
      {
        label: 'Bring All to Front',
        role: 'front',
      });
  }
  return Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

module.exports = createApplicationMenu;