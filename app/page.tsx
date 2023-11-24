"use client"
import Image from 'next/image'
import styles from './page.module.css'
import { useState, useEffect } from "react"
import CourseForm from '@/components/CourseForm'
import ScheduleTable from '@/components/ScheduleTable'
export default function Home() {
  const [courses, setCourses] = useState([])
  useEffect(() => {
  }, [courses])

  return (
    <div className="container">
      <div className="row">
        <h1>FISI - Generador de horarios</h1>
      </div>
      <div className='row'>
        <CourseForm courses={courses} setCourses={setCourses} />
      </div>
      <div className='row'>
        <ScheduleTable courses={courses} setCourses={setCourses} />
      </div>
    </div >
  )
}
