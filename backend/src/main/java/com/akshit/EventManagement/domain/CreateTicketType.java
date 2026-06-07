package com.akshit.EventManagement.domain;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTicketType {
    private String name;
    private Double price;
    private String description;
    private Integer totalAvailable;

}
