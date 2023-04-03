package com.capstone.lfsg.service;

import com.capstone.lfsg.data.Student;
import com.capstone.lfsg.data.StudentRepo;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StudentService {
    private final StudentRepo studentRepo;

    public StudentService(StudentRepo studentRepo) {
        this.studentRepo = studentRepo;
    }

    public Iterable<Student> saveData(String fname, String lname, String password, String email) {

        Student student = new Student();
        student.setFirstName(fname);
        student.setLastName(lname);
        student.setPassword(password);
        student.setEmail(email);
        student.setAvatarId("");
        student.setGold(0);
        studentRepo.save(student);
        return null;
    }
    public boolean emailExists(String email) {
        Iterable<Student> students = getAllStudents();
        for (Student student : students) {
            if (student.getEmail().equals(email)) {
                return true;
            }
        }
        return false;
    }
    public boolean studentExists(String email, String pass) {
        Iterable<Student> students = getAllStudents();
        for (Student student : students) {
            if (student.getEmail().equals(email) && student.getPassword().equals(pass)) {
                return true;
            }
        }
        return false;
    }
    public String returnFullName(String email, String pass) {
        Iterable<Student> students = getAllStudents();
        String studentName = "";
        for (Student student : students) {
            if(student.getEmail().equals(email) && student.getPassword().equals(pass)){
                studentName = student.getFirstName() + " " + student.getLastName();
                break;
            }
        }
        return studentName;
    }
    public boolean avatarIdExists(String avatarId) {
        Iterable<Student> students = getAllStudents();
        for (Student student : students) {
            if (student.getAvatarId().equals(avatarId)) {
                return true;
            }
        }
        return false;
    }
    public void deleteStudentByEmail(String email) {
        Optional<Student> studentOptional = studentRepo.findByEmail(email);
        studentOptional.ifPresent(student -> studentRepo.delete(student));
    }
    public Iterable<Student> getAllStudents() {
        Iterable<Student> students = this.studentRepo.findAll();
        return students;
    }
}
