import fs from "fs";
import path from "path";
// Process command line arguments
const args = process.argv.slice(2);
const jsonDirPath = args[0]; // First argument: JSON source directory
const outputFilePath = args[1]; // Second argument: Output file path

const combineJson = () => {
    // Determine the complete path for the output
    const outputPath = path.resolve(outputFilePath);

    // Ensure the directory exists
    if (!fs.existsSync(jsonDirPath)) {
        console.error("Directory does not exist:", jsonDirPath);
        return;
    }

    const files = fs.readdirSync(jsonDirPath);
    let combinedData = [];

    files.forEach(file => {
        const filePath = path.join(jsonDirPath, file);

        // Read file if it is a JSON file
        if (path.extname(file) === '.json') {
            const fileData = fs.readFileSync(filePath);
            const stats = fs.statSync(filePath);
            // Convert birthtime to Unix timestamp
            const creationTimeUnix = Math.floor(new Date(stats.birthtime).getTime() / 1000);
            const jsonData = JSON.parse(fileData);
            const eventData = {
                Severity: jsonData.Severity,
                typeOfEvent: jsonData.typeOfEvent,
                time: creationTimeUnix
            };
            // Combine json data
            combinedData.push(eventData);
        }
    });

    // Save combined JSON to the specified output file
    if (!fs.existsSync(path.dirname(outputPath))) {
        fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(combinedData, null, 4));

    console.log(`Combined JSON saved to ${outputPath}`);
};

combineJson();