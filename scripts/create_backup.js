import { exec } from 'child_process';
import path from 'path';

function backupMongoDBDocker() {
    const containerName = 'dai_project-mongo-1';
    const containerBackupDir = '/backup';
    const localBackupDir = path.join(process.cwd(), 'backup');

    const mongoUser = 'root';
    const mongoPassword = 'example';
    const mongoAuthDb = 'admin';
    const db = 'myProject'

    const mkdirCommand = `docker exec ${containerName} mkdir -p ${containerBackupDir}`;

    exec(mkdirCommand, (mkdirError, mkdirStdout) => {
        if (mkdirError) {
            console.error(`Error creando el directorio en Docker: ${mkdirError.message}`);
            return;
        }
        console.log(`Directorio creado dentro del contenedor: ${mkdirStdout}`);

        const mongodumpCommand = `docker exec ${containerName} mongodump --out=${containerBackupDir} --db=${db} --username=${mongoUser} --password=${mongoPassword} --authenticationDatabase=${mongoAuthDb}`;

        exec(mongodumpCommand, (error) => {
            if (error) {
                console.error(`Error ejecutando mongodump en Docker: ${error.message}`);
                return;
            }
            console.log(`Backup creado dentro del contenedor en el directorio: ${containerBackupDir}`);

            const dockerCopyCommand = `docker cp ${containerName}:${containerBackupDir}/${db} ${localBackupDir}`;
            exec(dockerCopyCommand, (copyError, copyStdout) => {
                if (copyError) {
                    console.error(`Error al copiar el backup fuera del contenedor: ${copyError.message}`);
                    return;
                }
                console.log(`Backup copiado a la máquina host en ${localBackupDir}: ${copyStdout}`);
            });
        });
    });
}

backupMongoDBDocker();
