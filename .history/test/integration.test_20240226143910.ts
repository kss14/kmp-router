import supertest from 'supertest';
import app from '';

describe('Integration Tests', () => {
    it('should respond with test response', async () => {
        const response = await supertest(app).get('/');
        expect(response.status).toBe(200);
        expect(response.text).toBe('Test response');
    });
});
