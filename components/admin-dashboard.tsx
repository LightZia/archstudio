"use client"

import { useState, useEffect, useRef } from "react"
import {
  BookOpen,
  Users,
  FileText,
  Plus,
  Pencil,
  X,
  Upload,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"
import { supabase } from "@/lib/supabase"

async function uploadToStorage(file: File): Promise<string> {
  // Create a unique filename
  const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`
  
  const { error } = await supabase.storage
    .from('certificate')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) {
    console.error("Supabase Storage Upload Error:", error)
    throw new Error("Failed to upload file to Supabase Storage.")
  }

  const { data: publicUrlData } = supabase.storage
    .from('certificate')
    .getPublicUrl(filename)
    
  return publicUrlData.publicUrl
}

type AdminTab = "courses" | "students" | "templates"

interface Course {
  id: string
  title: string
  description: string
  duration: string
  status: string
  thumbnail: string | null
  certificateTemplate: string | null
  createdAt?: Date
}

interface Student {
  id: string
  name: string
  phone: string
  email: string
  password?: string
  courseId: string
  courseName: string
  completed: boolean
  completedAt?: string
  certificateUrl?: string
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("courses")
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [uploadingCertFor, setUploadingCertFor] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: "course" | "student"
    id: string
    title: string
  } | null>(null)

  // New course form
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    duration: "",
    status: "active",
  })
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [templatePreview, setTemplatePreview] = useState<string | null>(null)

  // New student form
  const [newStudent, setNewStudent] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    courseId: "",
  })

  const certInputRef = useRef<HTMLInputElement>(null)
  const certUploadStudentId = useRef<string | null>(null)

  const sidebarItems = [
    { id: "courses" as AdminTab, label: "Courses", icon: BookOpen },
    { id: "students" as AdminTab, label: "Students", icon: Users },
    { id: "templates" as AdminTab, label: "Templates", icon: FileText },
  ]

  // ─── Real-time Firestore listeners ───────────────────────────────────────
  useEffect(() => {
    if (!db) {
      setLoading(false)
      return
    }

    const coursesQ = query(collection(db, "courses"), orderBy("createdAt", "desc"))
    const unsubCourses = onSnapshot(coursesQ, (snap) => {
      setCourses(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Course, "id">) }))
      )
      setLoading(false)
    })

    const studentsQ = query(collection(db, "students"), orderBy("createdAt", "desc"))
    const unsubStudents = onSnapshot(studentsQ, (snap) => {
      setStudents(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Student, "id">) }))
      )
    })

    return () => {
      unsubCourses()
      unsubStudents()
    }
  }, [])

  // ─── Helpers ─────────────────────────────────────────────────────────────
  const enrollmentCount = (courseId: string) =>
    students.filter((s) => s.courseId === courseId).length

  // uploadToCloudinary is defined at module level

  // ─── Course actions ───────────────────────────────────────────────────────
  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description || !db) return
    setSaving(true)
    try {
      let thumbnailUrl: string | null = null
      let templateUrl: string | null = null

      if (thumbnailFile) thumbnailUrl = await uploadToStorage(thumbnailFile)
      if (templateFile) templateUrl = await uploadToStorage(templateFile)

      await addDoc(collection(db, "courses"), {
        title: newCourse.title,
        description: newCourse.description,
        duration: newCourse.duration,
        status: newCourse.status,
        thumbnail: thumbnailUrl,
        certificateTemplate: templateUrl,
        createdAt: serverTimestamp(),
      })

      setNewCourse({ title: "", description: "", duration: "", status: "active" })
      setThumbnailFile(null)
      setTemplateFile(null)
      setThumbnailPreview(null)
      setTemplatePreview(null)
      setShowCourseModal(false)
    } catch (err) {
      console.error("Error creating course:", err)
    }
    setSaving(false)
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse || !db) return
    setSaving(true)
    try {
      let thumbnailUrl = editingCourse.thumbnail
      let templateUrl = editingCourse.certificateTemplate

      if (thumbnailFile) thumbnailUrl = await uploadToStorage(thumbnailFile)
      if (templateFile) templateUrl = await uploadToStorage(templateFile)

      await updateDoc(doc(db, "courses", editingCourse.id), {
        title: editingCourse.title,
        description: editingCourse.description,
        duration: editingCourse.duration,
        status: editingCourse.status,
        thumbnail: thumbnailUrl,
        certificateTemplate: templateUrl,
      })

      setEditingCourse(null)
      setThumbnailFile(null)
      setTemplateFile(null)
      setThumbnailPreview(null)
      setTemplatePreview(null)
    } catch (err) {
      console.error("Error updating course:", err)
    }
    setSaving(false)
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!db) return
    await deleteDoc(doc(db, "courses", courseId))
  }

  // ─── Student actions ──────────────────────────────────────────────────────
  const handleRegisterStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.password || !newStudent.courseId || !db) return
    setSaving(true)
    const course = courses.find((c) => c.id === newStudent.courseId)
    try {
      // 1. Create user in Firebase Auth via API
      const response = await fetch("/api/admin/create-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newStudent.email,
          password: newStudent.password,
          displayName: newStudent.name,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        const debugStr = data.debug ? `\n\nDEBUG: ${JSON.stringify(data.debug)}` : ""
        throw new Error((data.error || "Failed to create authentication account") + debugStr)
      }

      // 2. Add student record to Firestore
      await addDoc(collection(db, "students"), {
        uid: data.uid,
        name: newStudent.name,
        phone: newStudent.phone, // Optional phone
        email: newStudent.email,
        password: newStudent.password, // Store password so admin can see it
        courseId: newStudent.courseId,
        courseName: course?.title || "",
        completed: false,
        certificateUrl: null,
        createdAt: serverTimestamp(),
      })
      setNewStudent({ name: "", phone: "", email: "", password: "", courseId: "" })
      setShowStudentModal(false)
    } catch (err: any) {
      console.error("Error registering student:", err)
      alert(err.message || "Failed to register student")
    }
    setSaving(false)
  }

  const handleToggleComplete = async (student: Student) => {
    if (!db) return
    await updateDoc(doc(db, "students", student.id), {
      completed: !student.completed,
      completedAt: !student.completed ? new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null,
    })
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!db) return
    await deleteDoc(doc(db, "students", studentId))
  }

  const handleUploadCertificate = async (file: File, studentId: string) => {
    if (!db) return
    setUploadingCertFor(studentId)
    try {
      const url = await uploadToStorage(file)
      await updateDoc(doc(db, "students", studentId), { certificateUrl: url })
    } catch (err) {
      console.error("Error uploading certificate:", err)
    }
    setUploadingCertFor(null)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void,
    previewSetter: (s: string | null) => void
  ) => {
    const file = e.target.files?.[0] || null
    setter(file)
    if (file) {
      previewSetter(URL.createObjectURL(file))
    } else {
      previewSetter(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading dashboard…</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:block w-64 border-r border-border bg-sidebar fixed left-0 top-16 bottom-0 overflow-y-auto">
        <div className="p-6">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
            Management
          </p>
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  activeTab === item.id
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {activeTab === item.id && (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats */}
        <div className="p-6 border-t border-sidebar-border">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase mb-4">
            Overview
          </p>
          <div className="space-y-4">
            <div className="p-3 rounded-md bg-sidebar-accent/50">
              <p className="text-2xl font-bold text-sidebar-foreground">{courses.length}</p>
              <p className="text-xs text-muted-foreground">Active Courses</p>
            </div>
            <div className="p-3 rounded-md bg-sidebar-accent/50">
              <p className="text-2xl font-bold text-sidebar-foreground">{students.length}</p>
              <p className="text-xs text-muted-foreground">Enrolled Students</p>
            </div>
            <div className="p-3 rounded-md bg-sidebar-accent/50">
              <p className="text-2xl font-bold text-primary">
                {students.filter((s) => s.completed).length}
              </p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex gap-2 border-b border-border pb-4 mb-6 overflow-x-auto">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* ── Courses Tab ───────────────────────────────────────────── */}
        {activeTab === "courses" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Course Management</h1>
                <p className="text-muted-foreground mt-1">Create and manage your certification courses</p>
              </div>
              <Button
                onClick={() => setShowCourseModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No courses yet. Create your first course.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="group relative rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video bg-secondary flex items-center justify-center overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-foreground">{course.title}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingCourse(course)
                              setThumbnailFile(null)
                              setTemplateFile(null)
                              setThumbnailPreview(null)
                              setTemplatePreview(null)
                            }}
                            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ isOpen: true, type: "course", id: course.id, title: course.title })}
                            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                      {course.duration && (
                        <p className="text-xs text-muted-foreground">Duration: {course.duration}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {enrollmentCount(course.id)} students enrolled
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium",
                          course.status === "active"
                            ? "bg-primary/10 text-primary"
                            : "bg-secondary text-muted-foreground"
                        )}>
                          {course.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Students Tab ──────────────────────────────────────────── */}
        {activeTab === "students" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Student Management</h1>
                <p className="text-muted-foreground mt-1">Manage student enrollments and completion status</p>
              </div>
              <Button
                onClick={() => setShowStudentModal(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Register New Student
              </Button>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No students yet. Register your first student.</p>
              </div>
            ) : (
              <>
                {/* Mobile view - Cards Layout */}
                <div className="md:hidden space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-sm hover:border-primary/20 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-foreground text-base">{student.name}</h3>
                          {student.completed && student.completedAt && (
                            <p className="text-xs text-muted-foreground mt-0.5">Completed {student.completedAt}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, type: "student", id: student.id, title: student.name })}
                          className="p-2 rounded-md hover:bg-secondary transition-colors text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground/50">Phone Number</p>
                          <p className="text-foreground mt-0.5">{student.phone || "—"}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground/50">Assigned Course</p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-secondary text-foreground font-medium">
                            {student.courseName}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <p className="font-medium text-foreground/50">Email / ID</p>
                          <p className="text-foreground mt-0.5 break-all font-mono">{student.email}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="font-medium text-foreground/50">Password</p>
                          <p className="text-foreground mt-0.5 font-mono bg-secondary/50 px-2 py-1 rounded border border-border inline-block">
                            {student.password || "existing / hidden"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={student.completed}
                            onCheckedChange={() => handleToggleComplete(student)}
                          />
                          <span className={cn(
                            "text-xs font-semibold flex items-center gap-1",
                            student.completed ? "text-primary" : "text-muted-foreground"
                          )}>
                            {student.completed ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Done
                              </>
                            ) : "Active"}
                          </span>
                        </div>

                        <div>
                          {student.certificateUrl ? (
                            <div className="flex items-center gap-2">
                              <a
                                href={student.certificateUrl.endsWith('.pdf') ? student.certificateUrl : `${student.certificateUrl}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline font-medium"
                              >
                                View PDF
                              </a>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                id={`cert-reupload-mobile-${student.id}`}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (file) await handleUploadCertificate(file, student.id)
                                  e.target.value = ""
                                }}
                              />
                              <label
                                htmlFor={`cert-reupload-mobile-${student.id}`}
                                className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer underline flex items-center gap-1"
                              >
                                {uploadingCertFor === student.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Upload className="h-3 w-3" />
                                )}
                                Re-upload
                              </label>
                            </div>
                          ) : (
                            <div>
                              <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                id={`cert-upload-mobile-${student.id}`}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0]
                                  if (file) await handleUploadCertificate(file, student.id)
                                  e.target.value = ""
                                }}
                              />
                              <label
                                htmlFor={`cert-upload-mobile-${student.id}`}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors",
                                  "bg-secondary hover:bg-secondary/80 text-foreground"
                                )}
                              >
                                {uploadingCertFor === student.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Upload className="h-3.5 w-3.5" />
                                )}
                                Upload PDF
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop view - Table Layout */}
                <div className="hidden md:block rounded-lg border border-border overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phone Number</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Assigned Course</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Credentials (ID & Pwd)</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Mark Completed</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Certificate</th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => (
                        <tr
                          key={student.id}
                          className={cn(
                            "border-b border-border last:border-0 transition-colors hover:bg-secondary/30",
                            index % 2 === 0 ? "bg-card" : "bg-card/50"
                          )}
                        >
                          <td className="p-4">
                            <p className="font-medium text-foreground">{student.name}</p>
                            {student.completed && student.completedAt && (
                              <p className="text-xs text-muted-foreground mt-0.5">Completed {student.completedAt}</p>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">{student.phone || "—"}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-sm text-foreground">
                              {student.courseName}
                            </span>
                          </td>
                          <td className="p-4 space-y-1">
                            <p className="text-xs font-mono text-foreground break-all">{student.email}</p>
                            {student.password ? (
                              <span className="inline-block text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1 py-0.5 rounded border border-border">
                                pwd: {student.password}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/50">pwd: existing/hidden</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Switch
                                  checked={student.completed}
                                  onCheckedChange={() => handleToggleComplete(student)}
                              />
                              {student.completed && (
                                <span className="text-xs font-medium text-primary flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Done
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            {student.certificateUrl ? (
                              <div className="flex flex-col gap-1 items-start">
                                <a
                                  href={student.certificateUrl.endsWith('.pdf') ? student.certificateUrl : `${student.certificateUrl}.pdf`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary underline"
                                >
                                  View PDF
                                </a>
                                <div>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    id={`cert-reupload-${student.id}`}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0]
                                      if (file) await handleUploadCertificate(file, student.id)
                                      e.target.value = ""
                                    }}
                                  />
                                  <label
                                    htmlFor={`cert-reupload-${student.id}`}
                                    className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer underline flex items-center gap-1"
                                  >
                                    {uploadingCertFor === student.id ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Upload className="h-3 w-3" />
                                    )}
                                    Re-upload
                                  </label>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  id={`cert-upload-${student.id}`}
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0]
                                    if (file) await handleUploadCertificate(file, student.id)
                                    e.target.value = ""
                                  }}
                                />
                                <label
                                  htmlFor={`cert-upload-${student.id}`}
                                  className={cn(
                                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors",
                                    "bg-secondary hover:bg-secondary/80 text-foreground"
                                  )}
                                >
                                  {uploadingCertFor === student.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Upload className="h-3.5 w-3.5" />
                                  )}
                                  Upload
                                </label>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => setDeleteConfirm({ isOpen: true, type: "student", id: student.id, title: student.name })}
                              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Templates Tab ─────────────────────────────────────────── */}
        {activeTab === "templates" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Certificate Templates</h1>
                <p className="text-muted-foreground mt-1">Manage your premium certificate designs</p>
              </div>
            </div>

            {courses.filter((c) => c.certificateTemplate).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>No templates uploaded yet. Upload a template when creating or editing a course.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses
                  .filter((c) => c.certificateTemplate)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
                    >
                      <div className="aspect-[4/3] bg-secondary flex items-center justify-center border-b border-border overflow-hidden">
                        {course.certificateTemplate ? (
                          <img
                            src={course.certificateTemplate}
                            alt={`${course.title} template`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">Certificate template</p>
                        <a
                          href={course.certificateTemplate!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-primary underline"
                        >
                          Preview template
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Create Course Modal ──────────────────────────────────────── */}
      {showCourseModal && (
        <CourseModal
          title="Create New Course"
          course={newCourse}
          setCourseFn={(vals) => setNewCourse((prev) => ({ ...prev, ...vals }))}
          thumbnailPreview={thumbnailPreview}
          templatePreview={templatePreview}
          onThumbnailFile={(f) => { setThumbnailFile(f); setThumbnailPreview(f ? URL.createObjectURL(f) : null) }}
          onTemplateFile={(f) => { setTemplateFile(f); setTemplatePreview(f ? URL.createObjectURL(f) : null) }}
          onConfirm={handleCreateCourse}
          onClose={() => { setShowCourseModal(false); setThumbnailFile(null); setTemplateFile(null); setThumbnailPreview(null); setTemplatePreview(null) }}
          saving={saving}
        />
      )}

      {/* ── Edit Course Modal ────────────────────────────────────────── */}
      {editingCourse && (
        <CourseModal
          title="Edit Course"
          course={editingCourse}
          setCourseFn={(vals) => setEditingCourse((prev) => prev ? { ...prev, ...vals } : null)}
          thumbnailPreview={thumbnailPreview ?? editingCourse.thumbnail}
          templatePreview={templatePreview ?? editingCourse.certificateTemplate}
          onThumbnailFile={(f) => { setThumbnailFile(f); setThumbnailPreview(f ? URL.createObjectURL(f) : null) }}
          onTemplateFile={(f) => { setTemplateFile(f); setTemplatePreview(f ? URL.createObjectURL(f) : null) }}
          onConfirm={handleUpdateCourse}
          onClose={() => { setEditingCourse(null); setThumbnailFile(null); setTemplateFile(null); setThumbnailPreview(null); setTemplatePreview(null) }}
          saving={saving}
        />
      )}

      {/* ── Register Student Modal ───────────────────────────────────── */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowStudentModal(false)} />
          <div className="relative bg-card border border-border rounded-lg w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Register New Student</h2>
              <button onClick={() => setShowStudentModal(false)} className="p-2 rounded-md hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-foreground">Full Name</Label>
                <Input
                  id="studentName"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  placeholder="Enter student name"
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentPhone" className="text-foreground">Phone Number (Optional)</Label>
                <Input
                  id="studentPhone"
                  value={newStudent.phone}
                  onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentEmail" className="text-foreground">Email (User ID)</Label>
                <Input
                  id="studentEmail"
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="student@example.com"
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentPassword" className="text-foreground">Password</Label>
                <Input
                  id="studentPassword"
                  type="text"
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  placeholder="Enter password"
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentCourse" className="text-foreground">Assign Course</Label>
                <select
                  id="studentCourse"
                  value={newStudent.courseId}
                  onChange={(e) => setNewStudent({ ...newStudent, courseId: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <Button
                onClick={handleRegisterStudent}
                disabled={saving || !newStudent.name || !newStudent.email || !newStudent.password || !newStudent.courseId}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Register Student
              </Button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-card border border-border rounded-lg w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Confirm Deletion</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete the {deleteConfirm.type} <strong className="text-foreground">"{deleteConfirm.title}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={async () => {
                  if (deleteConfirm.type === "course") {
                    await handleDeleteCourse(deleteConfirm.id)
                  } else {
                    await handleDeleteStudent(deleteConfirm.id)
                  }
                  setDeleteConfirm(null)
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Shared Course Modal ──────────────────────────────────────────────────────
interface CourseModalProps {
  title: string
  course: { title: string; description: string; duration: string; status: string }
  setCourseFn: (v: Partial<{ title: string; description: string; duration: string; status: string }>) => void
  thumbnailPreview: string | null
  templatePreview: string | null
  onThumbnailFile: (f: File | null) => void
  onTemplateFile: (f: File | null) => void
  onConfirm: () => void
  onClose: () => void
  saving: boolean
}

function CourseModal({
  title,
  course,
  setCourseFn,
  thumbnailPreview,
  templatePreview,
  onThumbnailFile,
  onTemplateFile,
  onConfirm,
  onClose,
  saving,
}: CourseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-secondary transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-foreground">Course Title</Label>
            <Input
              value={course.title}
              onChange={(e) => setCourseFn({ title: e.target.value })}
              placeholder="Enter course title"
              className="bg-input border-border"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <textarea
              value={course.description}
              onChange={(e) => setCourseFn({ description: e.target.value })}
              placeholder="Enter course description"
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Duration</Label>
              <Input
                value={course.duration}
                onChange={(e) => setCourseFn({ duration: e.target.value })}
                placeholder="e.g. 8 weeks"
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Status</Label>
              <select
                value={course.status}
                onChange={(e) => setCourseFn({ status: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Upload zones */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Thumbnail</Label>
              <label className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onThumbnailFile(e.target.files?.[0] || null)}
                />
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail" className="h-20 w-full object-cover rounded" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload</p>
                  </>
                )}
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Certificate Template</Label>
              <label className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => onTemplateFile(e.target.files?.[0] || null)}
                />
                {templatePreview ? (
                  <img src={templatePreview} alt="Template" className="h-20 w-full object-cover rounded" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click to upload</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <Button
            onClick={onConfirm}
            disabled={saving || !course.title || !course.description}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {title}
          </Button>
        </div>
      </div>
    </div>
  )
}
