"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllUsers, updateUserStatus } from "@/services/user-service";
import {
  getAllMaterials,
  updateMaterialStatus,
} from "@/services/material-service";
import type { UserType } from "@/types/user";
import type { MaterialType } from "@/types/material";
import { Search, UserCog, Package } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType | null>(
    null
  );
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      const usersData = await getAllUsers();
      const materialsData = await getAllMaterials();
      setUsers(usersData);
      setMaterials(materialsData);
    };

    fetchData();
  }, [user, router]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMaterials = materials.filter(
    (material) =>
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserStatusChange = async (userId: string, status: string) => {
    await updateUserStatus(userId, status);
    setUsers(
      users.map((user) => (user.id === userId ? { ...user, status } : user))
    );
    setUserDialogOpen(false);
  };

  const handleMaterialStatusChange = async (
    materialId: string,
    status: string
  ) => {
    await updateMaterialStatus(materialId, status);
    setMaterials(
      materials.map((material) =>
        material.id === materialId ? { ...material, status } : material
      )
    );
    setMaterialDialogOpen(false);
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="materials">Материалы</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <UserCog className="mr-2 h-5 w-5" />
                    Управление пользователями
                  </CardTitle>
                  <CardDescription>
                    Всего пользователей: {users.length}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Поиск пользователей..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата регистрации</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.type === "buyer" ? "Покупатель" : "Продавец"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "destructive"
                          }
                        >
                          {user.status === "active"
                            ? "Активен"
                            : "Заблокирован"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setUserDialogOpen(true);
                          }}
                        >
                          Редактировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактирование пользователя</DialogTitle>
                <DialogDescription>
                  Изменение статуса пользователя {selectedUser?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="user-status" className="text-right">
                    Статус
                  </Label>
                  <Select
                    value={selectedUser?.status}
                    onValueChange={(value) => {
                      if (selectedUser) {
                        setSelectedUser({ ...selectedUser, status: value });
                      }
                    }}
                  >
                    <SelectTrigger id="user-status" className="col-span-3">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активен</SelectItem>
                      <SelectItem value="blocked">Заблокирован</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (selectedUser) {
                      handleUserStatusChange(
                        selectedUser.id,
                        selectedUser.status
                      );
                    }
                  }}
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Управление материалами
                  </CardTitle>
                  <CardDescription>
                    Всего материалов: {materials.length}
                  </CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Поиск материалов..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Цена</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>{material.name}</TableCell>
                      <TableCell>{material.type}</TableCell>
                      <TableCell>{material.price} ₸/кг</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            material.status === "active"
                              ? "default"
                              : material.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {material.status === "active"
                            ? "Активно"
                            : material.status === "pending"
                            ? "На проверке"
                            : "Отклонено"}
                        </Badge>
                      </TableCell>
                      <TableCell>{material.userName}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMaterial(material);
                            setMaterialDialogOpen(true);
                          }}
                        >
                          Редактировать
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog
            open={materialDialogOpen}
            onOpenChange={setMaterialDialogOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Редактирование материала</DialogTitle>
                <DialogDescription>
                  Изменение статуса материала {selectedMaterial?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="material-status" className="text-right">
                    Статус
                  </Label>
                  <Select
                    value={selectedMaterial?.status}
                    onValueChange={(value) => {
                      if (selectedMaterial) {
                        setSelectedMaterial({
                          ...selectedMaterial,
                          status: value,
                        });
                      }
                    }}
                  >
                    <SelectTrigger id="material-status" className="col-span-3">
                      <SelectValue placeholder="Выберите статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Активно</SelectItem>
                      <SelectItem value="pending">На проверке</SelectItem>
                      <SelectItem value="rejected">Отклонено</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setMaterialDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() => {
                    if (selectedMaterial) {
                      handleMaterialStatusChange(
                        selectedMaterial.id,
                        selectedMaterial.status
                      );
                    }
                  }}
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
