jest.mock('mongoose', () => {
    const mockConnection = {
        readyState: 0,
    };
    return {
        __esModule: true,
        default: {
            connect: jest.fn().mockImplementation(async () => {
                mockConnection.readyState = 1;
            }),
            connection: mockConnection,
        },
    };
});

describe('connectToDB', () => {
    let connectToDB: any;
    let mongoose: any;
    let mockMongooseConnect: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();

        const dbModule = require('../db');
        connectToDB = dbModule.connectToDB;
        mongoose = require('mongoose');

        mockMongooseConnect = mongoose.default.connect as jest.Mock;
        (mongoose.default.connection as any).readyState = 0;
    });

    afterEach(() => {
    });

    it('should not create a new connection if one already exists', async () => {
        (mongoose.default.connection as any).readyState = 1;
        await connectToDB();
        expect(mockMongooseConnect).not.toHaveBeenCalled();
    });

    it('should create a new connection if one does not exist', async () => {
        await connectToDB();
        expect(mockMongooseConnect).toHaveBeenCalledTimes(1);
        expect(mockMongooseConnect).toHaveBeenCalledWith(process.env.MONGO_URI, {
            dbName: 'user_tokens',
        });
        expect((mongoose.default.connection as any).readyState).toBe(1);
    });

    it('should re-throw if the connection fails', async () => {
        const connectionError = new Error('Connection failed');
        mockMongooseConnect.mockRejectedValue(connectionError);

        await expect(connectToDB()).rejects.toThrow('Connection failed');
    });
});
