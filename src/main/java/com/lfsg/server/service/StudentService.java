package com.lfsg.server.service;

import com.lfsg.server.data.Student;
import com.lfsg.server.data.StudentRepo;
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
        return students;
    }
}
