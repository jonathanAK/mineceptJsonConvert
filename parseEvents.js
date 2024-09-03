const fs = require('fs');
const path = require('path');

// Process command line arguments
const args = process.argv.slice(2);
const jsonDirPath = args[0]; // First argument: JSON source directory
const outputFilePath = args[1]; // Second argument: Output file path
const combineJson = (combinedData, dirPath) => {
    // Ensure the directory exists
    if (!fs.existsSync(dirPath)) {
        console.error("Directory does not exist:", dirPath);
        return;
    }

    const files = fs.readdirSync(dirPath);
    let eventData= {};
    files.forEach(file => {
        try{
            const filePath = path.join(dirPath, file);

            // Read file if it is a JSON file
            if (path.extname(file) === '.json') {
                const fileData = fs.readFileSync(filePath);
                const stats = fs.statSync(filePath);
                // Convert birthtime to Unix timestamp
                const creationTimeUnix = Math.floor(stats.mtimeMs / 1000);
                const jsonData = JSON.parse(fileData);
                const msgId = file.split('.')[0];
                // const msgId = jsonData.msgId;
                const seenMsg = msgId === eventData.msgId && eventData.time + 10 < creationTimeUnix && eventData.typeOfEvent === jsonData.typeOfEvent;
                if(!seenMsg){
                    combinedData.push(eventData);
                    eventData = {
                        msgId,
                        Severity: jsonData.Severity,
                        typeOfEvent: jsonData.typeOfEvent,
                        time: creationTimeUnix,
                        description: msgId.slice(-7),
                    };
                }else{
                    eventData.Severity= Math.max(eventData.Severity, jsonData.Severity);
                }
            }
        }catch (e) {
            console.log(`${dirPath}/${file}:\n${e}`)
        }

    });
    combinedData.push(eventData);
    combinedData.shift();
};


const checkFolders = () => {
    // Determine the complete path for the output
    const outputPath = path.resolve(outputFilePath);
    let combinedData = [];
    // Save combined JSON to the specified output file
    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    const folders = fs.readdirSync(jsonDirPath);
    folders.forEach((dir)=>{
        combineJson(combinedData, `${jsonDirPath}/${dir}`)
        fs.writeFileSync(`${outputPath}/${dir}.json`, JSON.stringify(combinedData, null, 4))
        console.log(`Combined JSON saved to ${outputPath}/${dir}.json`);
        combinedData = [];
    });

}

checkFolders();
