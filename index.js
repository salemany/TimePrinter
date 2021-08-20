const express = require('express');
const Printer = require('pdf-to-printer');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();

app.set('port', process.env.PORT || 3000);

async function fromDir(startPath,filter){
    var fecha = new Date();
    let hora = fecha.getHours();

    let opt = (hora >= 16) ? {printer: 'LISTADOS'} : {printer: 'CHEQUES'};

    if (!fs.existsSync(startPath)){
        console.log("no dir ",startPath);
        return;
    }
    
    let filesToPrint = [];

    let files = fs.readdirSync(startPath, (err, files) => files.filter((e) => path.extname(e).toLowerCase() === '.pdf'));

    for(var i=0;i<files.length;i++){
        let filename=path.join(startPath,files[i]);
        let stat = fs.lstatSync(filename);
        if (stat.isFile()){
            if(filename.toLowerCase().endsWith(filter)){
                filesToPrint.push(files[i]);

                Printer
                    .print(filename, opt)
                    .then(console.log('Impresion: ', filename, ' Impresora: ', JSON.stringify(opt)))
                    .catch(console.error);

                await sleep(1000);
            };
        };
    };

    await sleep(5000);

    for(var i = 0; i < filesToPrint.length; i++){            
        fs.rename(path.join(startPath,filesToPrint[i]), path.join(startPath, 'Procesados/',filesToPrint[i]), (err) => {
            if (err) throw err;
        });
    }
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

cron.schedule('* * * * *', () => {
    fromDir(path.join(__dirname, 'Archivos/'),'.pdf');
  });

app.listen(app.get('port'), () => {
    console.log('Server run on port ' + app.get('port'));
});