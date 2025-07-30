import { connectToDB } from '../db';

// Mock mongoose at the top level
jest.mock('mongoose', () => {
    const mockConnection = {
        readyState: 0, // Default state
    };
    return {
        __esModule: true,
        default: {
            connect: jest.fn().mockImplementation(async () => {
                mockConnection.readyState = 1; // Simulate successful connection
            }),
            connection: mockConnection, // Use the same connection object
        },
    };
});

describe('connectToDB', () => {
    let mongoose: any; // Declare mongoose here
    let mockMongooseConnect: jest.Mock; // Declare mockMongooseConnect here
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules(); // Reset modules to ensure a fresh import of db.ts
        
        // Re-import connectToDB and mongoose after resetting modules
        const dbModule = require('../db');
        connectToDB = dbModule.connectToDB;
        mongoose = require('mongoose'); // Re-import mongoose here
        
        // Assign mockMongooseConnect after mongoose is re-imported
        mockMongooseConnect = mongoose.default.connect as jest.Mock;

        // Ensure readyState is reset for each test
        (mongoose.default.connection as any).readyState = 0;

        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should not create a new connection if one already exists', async () => {
        (mongoose.default.connection as any).readyState = 1; // Simulate already connected
        await connectToDB();
        expect(mockMongooseConnect).not.toHaveBeenCalled();
    });

    it('should create a new connection if one does not exist', async () => {
        await connectToDB();
        expect(mockMongooseConnect).toHaveBeenCalledTimes(1);
        expect(mockMongooseConnect).toHaveBeenCalledWith(process.env.MONGO_URI, {
            dbName: 'user_tokens',
        });
        expect((mongoose.default.connection as any).readyState).toBe(1); // Should be connected
    });

    it('should log an error and re-throw if the connection fails', async () => {
        const connectionError = new Error('Connection failed');
        mockMongooseConnect.mockRejectedValue(connectionError); // Simulate failed connection

        await expect(connectToDB()).rejects.toThrow('Connection failed');
        expect(consoleErrorSpy).toHaveBeenCalledWith('❌ Error connecting to MongoDB:', connectionError);
    });
});