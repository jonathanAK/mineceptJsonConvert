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
                        id: msgId,
                        geom: '',
                        type_of_event: jsonData.typeOfEvent,
                        event_description: '',
                        severity: jsonData.Severity,
                        speed: 0,
                        distance: 0,
                        angle: 0,
                        other: `Distance: ?[m]   [#2][UniqueID:${msgId.slice(-7)}]`,
                        remarks: null,
                        created_by: '', // ???
                        operator_id: '', // ???
                        disable_by: null,
                        is_active: true,
                        creation_time: creationTimeUnix,
                        inactive_time: null,
                        is_position_valid: false,
                        clip_id: msgId,
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

const toCsvString = (data) => {
    let str = '';
    data.forEach((row)=>{
        str = str + `${row.id},,${row.type_of_event},${row.event_description},${row.severity},${row.speed},${row.distance},${row.angle},${row.other},${row.remarks},${row.created_by},"",NULL,True,${row.creation_time},NULL,True,${row.id}\n`;
    })
    return str;
}
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
        const csv = toCsvString(combinedData);
        fs.writeFileSync(`${outputPath}/${dir}.json`, JSON.stringify(combinedData, null, 4))
        fs.writeFileSync(`${outputPath}/${dir}.csv`, csv)
        console.log(`Combined JSON saved to ${outputPath}/${dir}.json`);
        combinedData = [];
    });

}

checkFolders();
