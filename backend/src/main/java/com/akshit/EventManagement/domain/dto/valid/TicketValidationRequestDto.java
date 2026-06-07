package com.akshit.EventManagement.domain.dto.valid;

import com.akshit.EventManagement.domain.entity.TicketValidation;
import com.akshit.EventManagement.domain.enums.TicketValidationMethodEnum;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketValidationRequestDto {

    @NotNull
    private UUID id;

    @NotNull
    private TicketValidationMethodEnum method;
}
