'use client'

import { useState, useEffect } from 'react'
import {
  Bell,
  Send,
  Users,
  User,
  Store,
  Shield,
  Megaphone,
  Loader2,
  CheckCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import {
  sendNotificationToUser,
  sendNotificationToAllUsers,
  sendNotificationToRole,
  type NotificationType,
} from '@/actions/notifications'
import { getAllUsers } from '@/actions/admin'

type TargetType = 'all' | 'role' | 'user'

const notificationTypes: { value: NotificationType; label: string }[] = [
  { value: 'announcement', label: 'Зарлал' },
  { value: 'promotion', label: 'Урамшуулал' },
  { value: 'system', label: 'Систем' },
]

export default function NotificationsPage() {
  const [targetType, setTargetType] = useState<TargetType>('all')
  const [selectedRole, setSelectedRole] = useState<'customer' | 'seller' | 'admin'>('customer')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [notificationType, setNotificationType] = useState<NotificationType>('announcement')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  // User search
  const [userSearch, setUserSearch] = useState('')
  const [users, setUsers] = useState<Array<{ id: string; email: string; full_name: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  // Search users when input changes
  useEffect(() => {
    if (targetType === 'user' && userSearch.length >= 2) {
      const timer = setTimeout(async () => {
        setLoadingUsers(true)
        const result = await getAllUsers({ search: userSearch, limit: 10 })
        if (result.users) {
          setUsers(result.users as any)
        }
        setLoadingUsers(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [userSearch, targetType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim() || !message.trim()) {
      toast.error('Гарчиг болон мессеж оруулна уу')
      return
    }

    if (targetType === 'user' && !selectedUserId) {
      toast.error('Хэрэглэгч сонгоно уу')
      return
    }

    setSending(true)
    setSuccess(false)

    try {
      let result

      const notification = {
        type: notificationType,
        title: title.trim(),
        message: message.trim(),
      }

      if (targetType === 'all') {
        result = await sendNotificationToAllUsers(notification)
      } else if (targetType === 'role') {
        result = await sendNotificationToRole(selectedRole, notification)
      } else {
        result = await sendNotificationToUser(selectedUserId, notification)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        setSuccess(true)
        const countMsg = 'count' in result ? ` (${result.count} хэрэглэгч)` : ''
        toast.success(`Мэдэгдэл амжилттай илгээгдлээ${countMsg}`)

        // Reset form
        setTitle('')
        setMessage('')
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      toast.error('Алдаа гарлаа')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Мэдэгдэл илгээх</h1>
        <p className="text-gray-500">Хэрэглэгчдэд мэдэгдэл илгээх</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-500" />
              Шинэ мэдэгдэл
            </CardTitle>
            <CardDescription>
              Хэрэглэгчдэд мэдэгдэл илгээх
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Target Selection */}
              <div className="space-y-3">
                <Label>Хүлээн авагч</Label>
                <RadioGroup
                  value={targetType}
                  onValueChange={(v) => setTargetType(v as TargetType)}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex cursor-pointer items-center gap-1">
                      <Users className="h-4 w-4" />
                      Бүх хэрэглэгч
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="role" id="role" />
                    <Label htmlFor="role" className="flex cursor-pointer items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Үүргээр
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label htmlFor="user" className="flex cursor-pointer items-center gap-1">
                      <User className="h-4 w-4" />
                      Тодорхой хэрэглэгч
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Role Selection */}
              {targetType === 'role' && (
                <div className="space-y-2">
                  <Label>Үүрэг сонгох</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => setSelectedRole(v as typeof selectedRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Худалдан авагч
                        </div>
                      </SelectItem>
                      <SelectItem value="seller">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          Худалдагч
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Админ
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* User Search */}
              {targetType === 'user' && (
                <div className="space-y-2">
                  <Label>Хэрэглэгч хайх</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Нэр эсвэл имэйлээр хайх..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {loadingUsers && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Хайж байна...
                    </div>
                  )}
                  {users.length > 0 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border">
                      {users.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 ${
                            selectedUserId === user.id ? 'bg-orange-50' : ''
                          }`}
                          onClick={() => {
                            setSelectedUserId(user.id)
                            setUserSearch(user.full_name || user.email)
                          }}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{user.full_name || 'Нэргүй'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          {selectedUserId === user.id && (
                            <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notification Type */}
              <div className="space-y-2">
                <Label>Мэдэгдлийн төрөл</Label>
                <Select
                  value={notificationType}
                  onValueChange={(v) => setNotificationType(v as NotificationType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {notificationTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Гарчиг</Label>
                <Input
                  id="title"
                  placeholder="Мэдэгдлийн гарчиг"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Мессеж</Label>
                <Textarea
                  id="message"
                  placeholder="Мэдэгдлийн агуулга"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">{message.length}/500</p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Илгээж байна...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Илгээгдсэн!
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Мэдэгдэл илгээх
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-orange-500" />
                Түргэн илгээх
              </CardTitle>
              <CardDescription>
                Бэлэн загварууд
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTargetType('all')
                  setNotificationType('promotion')
                  setTitle('Онцгой урамшуулал!')
                  setMessage('Манай дэлгүүрт онцгой хямдрал эхэллээ. Одоо худалдан аваарай!')
                }}
              >
                <Bell className="mr-2 h-4 w-4 text-orange-500" />
                Урамшуулалын мэдэгдэл
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTargetType('all')
                  setNotificationType('announcement')
                  setTitle('Чухал мэдэгдэл')
                  setMessage('')
                }}
              >
                <Megaphone className="mr-2 h-4 w-4 text-purple-500" />
                Ерөнхий зарлал
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTargetType('role')
                  setSelectedRole('seller')
                  setNotificationType('system')
                  setTitle('Худалдагчдад зориулсан мэдэгдэл')
                  setMessage('')
                }}
              >
                <Store className="mr-2 h-4 w-4 text-blue-500" />
                Худалдагчдад илгээх
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setTargetType('all')
                  setNotificationType('system')
                  setTitle('Систем засвар')
                  setMessage('Систем засварын улмаас түр хугацаанд ажиллагаа удаашрах боломжтой.')
                }}
              >
                <Shield className="mr-2 h-4 w-4 text-gray-500" />
                Системийн мэдэгдэл
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Bell className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Мэдэгдлийн тухай</p>
                  <ul className="mt-2 space-y-1 text-blue-700">
                    <li>• Бүх хэрэглэгч - Бүх бүртгэлтэй хэрэглэгчдэд илгээнэ</li>
                    <li>• Үүргээр - Тодорхой үүрэгтэй хэрэглэгчдэд илгээнэ</li>
                    <li>• Тодорхой хэрэглэгч - Нэг хэрэглэгчид илгээнэ</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
