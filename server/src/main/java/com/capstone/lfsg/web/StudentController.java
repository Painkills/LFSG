package com.capstone.lfsg.web;

import com.capstone.lfsg.data.Student;
import com.capstone.lfsg.service.StudentService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;

import javax.swing.*;
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
    @PostMapping(value = {"/registering", "/registering/"})
    private String registerStudent(Model model, @RequestParam("user-fname") String fname,@RequestParam("user-lname") String lname,
                                   @RequestParam("password") String password, @RequestParam("email") String email) {
        String[] parts = email.split("@");
        String domain = parts[1];
        String[] institutions = {"georgebrown.ca", "utoronto.ca", "humber.ca", "senecacollege.ca"};
        System.out.println(domain);
        boolean containsInstitution = false;
        for (String institution : institutions) {
            if (domain.contains(institution)) {
                containsInstitution = true;
                break;
            }
        }
        if(studentService.emailExists(email) || !containsInstitution){
            model.addAttribute("emailExists", "Email Already exists or is not apart of our school institution email list");
           return "badScreen";
        }

            studentService.saveData(fname, lname, password, email);
            return "redirect:http://localhost:3000/";

    }
    @RequestMapping (value = {"/loginAttempt", "/loginAttempt/"})
    private RedirectView loginStudent(Model model, @RequestParam("email") String email, @RequestParam("password") String password){
        RedirectView redirectView = new RedirectView();
        if(studentService.studentExists(email,password)){
            redirectView.setUrl("http://localhost:3000");
            redirectView.addStaticAttribute("login", "true");
            redirectView.addStaticAttribute("fullName", studentService.returnFullName(email, password));
            return redirectView;
        }
        else{
            redirectView.setUrl("http://localhost:3000");
            return redirectView;
        }
    }



}
