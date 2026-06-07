package com.akshit.EventManagement.domain.dto.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTicketTypeDto {

    private UUID id;

    @NotBlank(message = "Ticket name is required")
    private String name;

    @NotNull(message = "Ticket price is required")
    @PositiveOrZero(message = "Ticket price must be greater then zero")
    private Double price;

    @NotNull(message = "Description is required")
    private String description;

    private Integer totalAvailable;
}
