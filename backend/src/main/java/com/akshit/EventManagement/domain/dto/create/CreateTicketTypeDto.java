package com.akshit.EventManagement.domain.dto.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTicketTypeDto {

    @NotBlank(message = "Ticket name is required")
    private String name;

    @NotNull(message = "Ticket price is required")
    @PositiveOrZero(message = "Ticket price must be greater then zero")
    private Double price;

    @NotNull(message = "Description is required")
    private String description;

    private Integer totalAvailable;
}
