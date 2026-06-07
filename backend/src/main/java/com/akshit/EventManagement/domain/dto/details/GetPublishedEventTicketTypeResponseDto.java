package com.akshit.EventManagement.domain.dto.details;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GetPublishedEventTicketTypeResponseDto {

    private UUID id;
    private String name;
    private Double price;
    private String description;



}
