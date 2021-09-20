const express = require('express');
const Printer = require('pdf-to-printer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
app.set('port', process.env.PORT || 3000);

async function fromDir(startPath,filter){
    var fecha = new Date();
    let hora = fecha.getHours(); //comentario de prueba

    //selecting a printer by the hour, this opt it's used on printer function
    let opt = (hora >= 16) ? {printer: 'Printer_01'} : {printer: 'Printer_02'}; 

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }
    
    let filesToPrint = [];

    let files = fs.readdirSync(startPath);

    for(var i=0;i<files.length;i++){
        let filename=path.join(startPath,files[i]);
        let stat = fs.lstatSync(filename);
        if (stat.isFile()){
            if(filename.toLowerCase().endsWith(filter)){ //filering by extension
                //Saving an array whit the files to move later
                filesToPrint.push(files[i]); 

                Printer
                    .print(filename, opt) //Print the file on the printer
                    .then(console.log('Impresion: ', filename, ' Impresora: ', JSON.stringify(opt)))
                    .catch(console.error);

                await sleep(1000);
            };
        };
    };
    
    //Wait 5 Sec to move Files to Proccess Directory
    await sleep(5000);

    for(var i = 0; i < filesToPrint.length; i++){            
        fs.rename(path.join(startPath,filesToPrint[i]), path.join(startPath, 'Procesados/',filesToPrint[i]), (err) => {
            if (err) throw err;
        });
    }
};

//Sleep Function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

//Run Every Minute, every day.
cron.schedule('* * * * *', () => {
    fromDir(path.join(__dirname, 'Archivos/'),'.pdf');
  });

app.listen(app.get('port'), () => {
    console.log('Server run on port ' + app.get('port'));
});
