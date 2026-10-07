import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircleIcon, Loader2Icon } from 'lucide-react'
import { useAuth } from '@/auth/use-auth'
import { useAuthForm } from '@/auth/use-auth-form'
import { FieldError } from '@/components/field-error'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ApiError,
  TASK_TITLE_MAX_LENGTH,
  TITLE_MESSAGES,
  createTask,
  listTasks,
  updateTaskStatus,
} from '@/lib/api'
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from '@/lib/types'

const FIELDS = ['title'] as const

const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : 'Algo ha ido mal. Inténtalo de nuevo.'

/** El responsable se identifica por su nombre; nunca por su email ni su id. */
const assigneeName = (task: Task) =>
  task.assignee.fullName?.trim() || 'Sin nombre'

export function TasksPage() {
  // `ProtectedRoute` garantiza que aquí ya hay sesión resuelta.
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [updatingIds, setUpdatingIds] = useState<ReadonlySet<number>>(
    () => new Set(),
  )
  const [title, setTitle] = useState('')
  const { isSubmitting, formError, fieldErrors, submit, failWith } =
    useAuthForm(FIELDS)

  useEffect(() => {
    if (!token) return

    let cancelled = false

    // Sin regla de orden decidida: las tareas se pintan en el orden en que
    // llegan, sin reordenarlas aquí.
    listTasks(token)
      .then((loaded) => {
        if (!cancelled) setTasks(loaded)
      })
      .catch((error: unknown) => {
        if (!cancelled) setLoadError(errorMessage(error))
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return

    // Mismas reglas que el backend, medidas sobre lo que de verdad se guarda.
    const trimmed = title.trim()
    if (!trimmed) {
      failWith('title', TITLE_MESSAGES.empty)
      return
    }
    if (trimmed.length > TASK_TITLE_MAX_LENGTH) {
      failWith('title', TITLE_MESSAGES.tooLong)
      return
    }

    return submit(async () => {
      const created = await createTask(token, trimmed)
      setTasks((current) => [...(current ?? []), created])
      setTitle('')
    })
  }

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (!token || status === task.status) return

    const previous = task.status
    const replace = (next: Task) =>
      setTasks((current) =>
        (current ?? []).map((item) => (item.id === next.id ? next : item)),
      )

    // Optimista: la fila cambia ya y sus botones se bloquean hasta que el
    // servidor responda, para que dos clics seguidos no se pisen al deshacer.
    setStatusError(null)
    replace({ ...task, status })
    setUpdatingIds((current) => new Set(current).add(task.id))

    try {
      replace(await updateTaskStatus(token, task.id, status))
    } catch (error) {
      replace({ ...task, status: previous })
      setStatusError(errorMessage(error))
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current)
        next.delete(task.id)
        return next
      })
    }
  }

  return (
    <div className="bg-muted/40 flex min-h-svh justify-center p-6">
      <Card className="h-fit w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Tareas del equipo</CardTitle>
              <CardDescription>
                Una sola lista para todos: quién lleva cada tarea y en qué
                estado está.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/profile">Perfil</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6">
          <form onSubmit={handleCreate} className="grid gap-2" noValidate>
            {formError && (
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Label htmlFor="title">Nueva tarea</Label>
            <div className="flex gap-2">
              <Input
                id="title"
                name="title"
                autoComplete="off"
                placeholder="¿En qué estás trabajando?"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? 'title-error' : undefined}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando…' : 'Crear tarea'}
              </Button>
            </div>
            <FieldError id="title-error" message={fieldErrors.title} />
          </form>

          {statusError && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{statusError}</AlertDescription>
            </Alert>
          )}

          {loadError ? (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
          ) : tasks === null ? (
            <div
              className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm"
              role="status"
              aria-live="polite"
            >
              <Loader2Icon className="size-4 animate-spin" />
              Cargando tareas…
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Aquí aparecerán las tareas de todo el equipo, con quién lleva cada
              una y en qué estado está. Escribe arriba el título de la primera.
            </p>
          ) : (
            <ul className="divide-y">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium wrap-anywhere">{task.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {assigneeName(task)}
                    </p>
                  </div>
                  <div
                    className="flex shrink-0 gap-1"
                    role="group"
                    aria-label={`Estado de «${task.title}»`}
                  >
                    {TASK_STATUSES.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        size="sm"
                        variant={status === task.status ? 'default' : 'outline'}
                        aria-pressed={status === task.status}
                        disabled={updatingIds.has(task.id)}
                        onClick={() => handleStatusChange(task, status)}
                      >
                        {STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
