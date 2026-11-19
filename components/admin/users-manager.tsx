'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { KeyRound, Loader2, Plus, Trash2 } from 'lucide-react'
import { api, errorMessage } from '@/lib/client-api'
import { useApi } from '@/lib/use-api'
import { ROLES, ROLE_LABELS, type Role } from '@/lib/auth/roles'
import { Button } from '@/components/ui/button'
import { Input, NativeSelect } from '@/components/ui/input'
import { Badge, Label } from '@/components/ui/misc'
import { Switch } from '@/components/ui/controls'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type User = {
  id: string
  username: string
  role: Role
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const ROLE_HELP: Record<Role, string> = {
  admin: 'Everything, including managing users.',
  editor: 'Prices (enter, correct, publish), catalogue, markets, articles and the audit log.',
  collector: 'Field data entry only: enters draft prices; an editor reviews and publishes.',
}

export function UsersManager({ currentUserId }: { currentUserId: string }) {
  const { data: users, loading, reload } = useApi<User[]>('/api/admin/users')
  const [creating, setCreating] = useState(false)
  const [resetting, setResetting] = useState<User | null>(null)

  const patch = async (u: User, body: Partial<Pick<User, 'role' | 'isActive'>>) => {
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'PATCH', json: body })
      toast.success(`Updated ${u.username}`)
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const remove = async (u: User) => {
    if (!window.confirm(`Delete the account "${u.username}"? This cannot be undone.`)) return
    try {
      await api(`/api/admin/users/${u.id}`, { method: 'DELETE' })
      toast.success(`Deleted ${u.username}`)
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="space-y-4">
      <dl className="border-border grid gap-3 rounded-2xl border bg-white p-4 text-sm sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r}>
            <dt className="text-ink font-semibold">{ROLE_LABELS[r]}</dt>
            <dd className="text-ink-muted">{ROLE_HELP[r]}</dd>
          </div>
        ))}
      </dl>

      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus /> Add user
        </Button>
      </div>

      {loading && !users ? (
        <div className="text-ink-muted flex items-center justify-center gap-2 rounded-2xl border bg-white p-10">
          <Loader2 className="size-5 animate-spin" /> Loading…
        </div>
      ) : (
        <ul className="border-border divide-border divide-y rounded-2xl border bg-white">
          {(users ?? []).map((u) => {
            const self = u.id === currentUserId
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-40 flex-1">
                  <p className="text-ink font-medium">
                    {u.username} {self ? <Badge variant="muted">You</Badge> : null}
                    {!u.isActive ? <Badge variant="warning">Inactive</Badge> : null}
                  </p>
                  <p className="text-ink-muted text-xs">
                    Last sign-in:{' '}
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' })
                      : 'never'}
                  </p>
                </div>
                <NativeSelect
                  value={u.role}
                  disabled={self}
                  onChange={(e) => patch(u, { role: e.target.value as Role })}
                  className="w-auto"
                  aria-label={`Role for ${u.username}`}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </option>
                  ))}
                </NativeSelect>
                <label className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={u.isActive}
                    disabled={self}
                    onCheckedChange={(v) => patch(u, { isActive: v })}
                    aria-label={`Active: ${u.username}`}
                  />
                  Active
                </label>
                <Button variant="outline" size="sm" onClick={() => setResetting(u)}>
                  <KeyRound /> Password
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={self}
                  onClick={() => remove(u)}
                  aria-label={`Delete ${u.username}`}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            )
          })}
        </ul>
      )}

      {creating ? (
        <UserDialog
          onClose={() => setCreating(false)}
          onDone={() => {
            setCreating(false)
            reload()
          }}
        />
      ) : null}
      {resetting ? (
        <UserDialog
          user={resetting}
          onClose={() => setResetting(null)}
          onDone={() => {
            setResetting(null)
            reload()
          }}
        />
      ) : null}
    </div>
  )
}

function UserDialog({
  user,
  onClose,
  onDone,
}: {
  user?: User
  onClose: () => void
  onDone: () => void
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('collector')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (user) {
        await api(`/api/admin/users/${user.id}`, { method: 'PATCH', json: { password } })
        toast.success(`Password changed for ${user.username}`)
      } else {
        await api('/api/admin/users', { method: 'POST', json: { username, password, role } })
        toast.success(`Created ${username}`)
      }
      onDone()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{user ? `Set password for ${user.username}` : 'Add user'}</DialogTitle>
            <DialogDescription>
              Passwords are stored only as bcrypt hashes. Use at least 10 characters.
            </DialogDescription>
          </DialogHeader>
          {!user ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="nu-name">Username</Label>
                <Input
                  id="nu-name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nu-role">Role</Label>
                <NativeSelect
                  id="nu-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r]} — {ROLE_HELP[r]}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="nu-pass">{user ? 'New password' : 'Password'}</Label>
            <Input
              id="nu-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={10}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || password.length < 10}>
              {saving ? <Loader2 className="animate-spin" /> : null} Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
