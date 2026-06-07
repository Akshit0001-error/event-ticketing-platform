package com.akshit.EventManagement.domain.dto.create;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTicketTypeResponseDto {

    private UUID id;
    private String name;
    private Double price;
    private Integer totalAvailable;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;


}
