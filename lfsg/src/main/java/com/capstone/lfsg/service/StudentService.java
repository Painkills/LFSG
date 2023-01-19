package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Student;
import com.capstone.lfsg.data.StudentRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {
    private final StudentRepo studentRepo;

    public StudentService(StudentRepo studentRepo) {
        this.studentRepo = studentRepo;
    }

    public Iterable<Student> getAllStudents() {
        Iterable<Student> students = this.studentRepo.findAll();
        System.out.println(students);
        return students;
    }
}
