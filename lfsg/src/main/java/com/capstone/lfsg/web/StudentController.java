package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Student;
import com.capstone.lfsg.service.StudentService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/students")
public class StudentController {
    public final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping(value = {"", "/"})
    private String getAllStudents(Model model) {
        Iterable<Student> students = studentService.getAllStudents();
        model.addAttribute("req", "list");
        model.addAttribute("title", "Student List");
        model.addAttribute("students", students);
        return "studentList";
    }
}
