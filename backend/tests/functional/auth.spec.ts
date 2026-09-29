import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

const EMAIL = 'kan1.e2e.0923@test.com'
const PASSWORD = 'Secreta123'

const signupPayload = (overrides: Record<string, unknown> = {}) => ({
  email: EMAIL,
  password: PASSWORD,
  passwordConfirmation: PASSWORD,
  ...overrides,
})

test.group('Auth | signup', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('creates the account and stores the email in lowercase', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/auth/signup')
      .json(signupPayload({ email: EMAIL.toUpperCase() }))

    response.assertStatus(200)
    assert.equal(response.body().data.user.email, EMAIL)
    assert.notProperty(response.body().data, 'token')

    const user = await User.findByOrFail('email', EMAIL)
    assert.equal(user.email, EMAIL)
  })

  test('rejects a duplicated email regardless of case', async ({ client, assert }) => {
    await User.create({ email: EMAIL, password: PASSWORD })

    const response = await client
      .post('/api/v1/auth/signup')
      .json(signupPayload({ email: EMAIL.toUpperCase() }))

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ field: 'email', message: 'Ya existe una cuenta con este email.' }],
    })
    assert.lengthOf(await User.all(), 1)
  })

  test('rejects a password without uppercase, lowercase and digit ({0})')
    .with(['secreta123', 'SECRETA123', 'SecretaSin', 'Sec1'])
    .run(async ({ client, assert }, password) => {
      const response = await client
        .post('/api/v1/auth/signup')
        .json(signupPayload({ password, passwordConfirmation: password }))

      response.assertStatus(422)
      response.assertBodyContains({
        errors: [
          {
            field: 'password',
            message:
              'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.',
          },
        ],
      })
      assert.lengthOf(await User.all(), 0)
    })

  test('rejects a confirmation that does not match', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/auth/signup')
      .json(signupPayload({ passwordConfirmation: 'Otra12345' }))

    response.assertStatus(422)
    response.assertBodyContains({
      errors: [{ field: 'passwordConfirmation', message: 'Las contraseñas no coinciden' }],
    })
    assert.lengthOf(await User.all(), 0)
  })
})

test.group('Auth | login, profile and logout', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())
  group.each.setup(async () => {
    await User.create({ email: EMAIL, password: PASSWORD })
  })

  test('logs in with valid credentials, ignoring email case', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: EMAIL.toUpperCase(), password: PASSWORD })

    response.assertStatus(200)
    assert.isString(response.body().data.token)
  })

  test('rejects {0}')
    .with([
      { label: 'a wrong password', email: EMAIL, password: 'Incorrecta1' },
      { label: 'an unknown email', email: 'nadie@test.com', password: PASSWORD },
    ])
    .run(async ({ client }, { email, password }) => {
      const response = await client.post('/api/v1/auth/login').json({ email, password })

      response.assertStatus(400)
    })

  test('returns the profile with initials', async ({ client }) => {
    const user = await User.findByOrFail('email', EMAIL)

    const response = await client.get('/api/v1/account/profile').loginAs(user)

    response.assertStatus(200)
    response.assertBodyContains({ data: { email: EMAIL, initials: 'KT' } })
  })

  test('rejects the profile without a token', async ({ client }) => {
    const response = await client.get('/api/v1/account/profile')

    response.assertStatus(401)
  })

  test('invalidates the token on logout', async ({ client }) => {
    const login = await client.post('/api/v1/auth/login').json({ email: EMAIL, password: PASSWORD })
    const token = login.body().data.token

    const logout = await client.post('/api/v1/account/logout').bearerToken(token)
    logout.assertStatus(200)

    const profile = await client.get('/api/v1/account/profile').bearerToken(token)
    profile.assertStatus(401)
  })
})
