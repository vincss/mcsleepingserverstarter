import { createConnection } from 'net';

export const isInDev = () => {
    if (process.env.NODE_ENV === 'development') {
        return true;
    }
    return false;
}

export const isPortTaken = (port: number) => new Promise<boolean>((resolve) => {

    const client = createConnection({ port }, () => {
        client.end();
        resolve(true);
    }).once("error", () => {
        resolve(false);
    });

});

export enum ServerStatus {
    Sleeping = 'Sleeping',
    Running = 'Running',
    Starting = 'Starting',
    Stopped = 'Stopped'
}