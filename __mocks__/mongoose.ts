const mockConnection = {
    readyState: 0, // Default state
};

const MockSchema = class Schema {
    constructor(definition: any) {
        // Mock constructor logic if needed
    }
    static Types = {
        ObjectId: jest.fn(() => 'mock-object-id'),
    };
};

const mockMongoose = {
    connect: jest.fn().mockImplementation(async () => {
        mockConnection.readyState = 1; // Simulate successful connection
        
    }),
    connection: mockConnection, // Use the same connection object
    Schema: MockSchema,
    model: jest.fn().mockImplementation(() => ({
        create: jest.fn(),
        findOne: jest.fn(),
        findOneAndUpdate: jest.fn(),
        find: jest.fn().mockImplementation(() => ({
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]),
        })),
    })),
    models: {},
};

module.exports = {
    __esModule: true, // Important for mocking default exports
    default: mockMongoose,
    Schema: MockSchema, // Export Schema as a named export
};