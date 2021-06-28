const request = require('supertest')
const app = require('../src/app')
const { readFileSync } = require('fs')
// Service Helper Functions
const registerUser = require('../src/services/registerUser')
const findUserByEmail = require('../src/services/findUserByEmail')
const deleteAllUsers = require('../src/services/deleteAllUsers')
const saveMovie = require('../src/services/saveMovie')
 
// Valid test account
let user = {
    name: 'John Doe',
    email: 'john@doe.com',
    password: 'JOHN-DOE0007',
}
 
// Ensure consistent testing environment
beforeAll(async () => {
    await deleteAllUsers(app.locals.dbConnection)
    await registerUser(app.locals.dbConnection, user)
    user.auth_tokens = findUserByEmail(app.locals.dbConnection, user.email).auth_tokens
})
 
test('Should signup new user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Jesse Pinkman',
        email: 'jesse@pinkman.com',
        password: 'MyPass777!'
    }).expect(201)
 
    // Assert that the databse was changed correctly...
    const user = await findUserByEmail(app.locals.dbConnection, 'jesse@pinkman.com')
    expect(user).not.toBeNull()
    expect(user.password).not.toBe('MyPass777!')
 
    // Assertion about the response
    expect(response.cookies).toMatchObject({
        Authorization: user.auth_tokens
    })
})
 
test('Should not signup user when providing weak password', async () => {
    user.password = '12345'
    
    await request(app)
        .post('/registrieren')
        .send({
            email: user.email,
            password: user.password,
            passwordConfirmation: user.password
        })
        .expect(400)
 
    // Assert that the databse hasn't been changed
    const user = await findUserByEmail(response.body.user.email)
    expect(user).toBeNull()
})
 
test('Should login existing user', async () => {
    await request(app)
        .post('/anmelden')
        .send({
            email: 'john@doe.com',
            password: 'JOHN-DOE0007',
        })
        .expect(200)
 
    /* Assert that the authentication token in the database matches the 
    authentication token sent back to the client */  
    const user = await findUserByEmail(app.locals.dbConnection, user.email)
    expect(response.cookies.Authorization).toBe(user.auth_tokens[1])
})
 
test('Should delete account for authenticated user', async () => {
    await request(app)
        .delete('/konto')
        .set('Authorization', `Bearer ${user.auth_tokens}`)
        .send()
        .expect(200)
 
    // Assert that the databse was changed correctly
    const user = await findUserByEmail(app.locals.dbConnection, user.email)
    expect(user).toBeNull()
})
 
test('Should be redirected when not authenticated', async () => {
    await request(app)
        .get('/bestellen/1')
        .send()
        .expect(302)
})