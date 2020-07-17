import { existsSync, fstatSync, Stats, readFileSync, mkdirSync } from "fs";
import { execFileSync } from "child_process";
import { join } from "path";
import { hostname } from "os";

const certFolder = join(process.cwd(), "cert");

/**
 * @throws 
 */
export function createDeviceCert(): void {
    execFileSync("./createDevice-Cert.sh", [hostname()], { cwd: certFolder, stdio: "inherit" });
}

/**
 * @throws 
 */
export function createCA(): void {
    execFileSync("./createCA-Cert.sh", [hostname()], { cwd: certFolder, stdio: "inherit" });
}

/**
 * @returns Key as Buffer
 */
export function retrivePrivateKey(): Buffer {
    return readFileSync("./cert/device.key");
}

/**
 * @returns Cert as Buffer
 */
export function retrivePublicKey(): Buffer {
    return readFileSync("./cert/device.crt");
}

/**
 * @returns boolean whether device key and cert are available
 */
export function certAvailable(): boolean {
    if (existsSync(certFolder)) {
        if (existsSync(join(certFolder, "device.crt")) && existsSync(join(certFolder, "device.key"))) {
            return true;
        } else {
            console.log("No cert");
        }

    } else {
       mkdirSync(certFolder);
       console.log("no folder");
    }
    return false;
}

/**
 * @returns boolean whether ca key and cert are available
 */
export function caCertAvailable(): boolean {
    if (existsSync(certFolder)) {
        if (existsSync(join(certFolder, "ca.crt")) && existsSync(join(certFolder, "ca.key"))) {
            return true;
        } else {
            console.log("no ca");
        }
    } else {
        mkdirSync(certFolder);
        console.log("no folder");

    }
    return false;
}
