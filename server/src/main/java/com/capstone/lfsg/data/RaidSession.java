package com.capstone.lfsg.data;

import lombok.*;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class RaidSession {

    @Id
    private String id;
    private String courseCode;
    private String courseName;
    private String courseDescription;
    private List<String> studentIdList;
    private List<String> roomIdList;
    private List<String> authorizedDomainList;

    public void addStudent(String studentId) {
        this.studentIdList.add(studentId);
    }

    public void removeStudent(String studentId) {
        this.studentIdList.remove(studentId);
    }

    public void addRoom(String roomId) {
        this.roomIdList.add(roomId);
    }

    public void addDomain(String domainId) {
        this.authorizedDomainList.add(domainId);
    }

    public void removeDomain(String domain) {
        this.authorizedDomainList.remove(domain);
    }
}
