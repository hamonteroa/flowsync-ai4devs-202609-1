import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import type { Assert } from '@japa/assert'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea no
 * filtra datos de cuenta y responsable sin nombre. Cada uno se comprueba
 * tanto en la tarea suelta como dentro de la lista.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-08-13'
  // Lo único que puede acompañar a una tarea de su responsable.
  const PERMITIDAS = ['id', 'fullName', 'initials']

  async function escenario(fullName: string | null) {
    const responsable = await User.create({
      fullName,
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const task = await Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: responsable.id,
    })
    // Quien mira es otra cuenta: la tarea es ajena a propósito.
    const observador = await User.create({
      fullName: 'Grace Hopper',
      email: 'grace@example.com',
      password: 'secreto123',
    })
    const token = await User.accessTokens.create(observador)
    return { task, bearer: `Bearer ${token.value!.release()}` }
  }

  async function assignees(
    client: any,
    assert: Assert,
    task: Task,
    bearer: string
  ): Promise<Array<[string, Record<string, unknown>]>> {
    const suelta = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: HOY })
      .header('Authorization', bearer)
    suelta.assertStatus(200)

    const lista = await client.get('/api/v1/tasks').header('Authorization', bearer)
    lista.assertStatus(200)
    const fila = lista.body().data.find((t: { id: number }) => t.id === task.id)
    assert.exists(fila, 'la tarea aparece en la lista')

    return [
      ['tarea suelta', suelta.body().data.assignee],
      ['lista', fila.assignee],
    ]
  }

  test('el assignee trae el nombre y las iniciales del responsable', async ({ client, assert }) => {
    const { task, bearer } = await escenario('Ada Lovelace')

    for (const [donde, assignee] of await assignees(client, assert, task, bearer)) {
      assert.equal(assignee.fullName, 'Ada Lovelace', donde)
      assert.equal(assignee.initials, 'AL', donde)
    }
  })

  test('el assignee no incluye el email ni ningún otro dato de la cuenta', async ({
    client,
    assert,
  }) => {
    const { task, bearer } = await escenario('Ada Lovelace')

    for (const [donde, assignee] of await assignees(client, assert, task, bearer)) {
      assert.notProperty(assignee, 'email', `${donde}: assignee no debe traer el email`)
      assert.notInclude(JSON.stringify(assignee), 'ada@example.com', donde)
      const sobrantes = Object.keys(assignee).filter((k) => !PERMITIDAS.includes(k))
      assert.deepEqual(sobrantes, [], `${donde}: claves no permitidas en assignee`)
    }
  })

  test('un responsable sin nombre llega con nombre nulo y sus iniciales', async ({
    client,
    assert,
  }) => {
    const { task, bearer } = await escenario(null)

    for (const [donde, assignee] of await assignees(client, assert, task, bearer)) {
      assert.isNull(assignee.fullName, donde)
      assert.isString(assignee.initials, donde)
      assert.isNotEmpty(assignee.initials as string, donde)
    }
  })
})
