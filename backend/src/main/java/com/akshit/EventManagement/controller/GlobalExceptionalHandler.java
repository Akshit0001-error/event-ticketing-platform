package com.akshit.EventManagement.controller;

import com.akshit.EventManagement.domain.dto.common.ErrorDto;
import com.akshit.EventManagement.exceptions.*;
import com.razorpay.RazorpayException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionalHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorDto> handleInvalidCredentials(InvalidCredentialsException ex) {
        log.warn("Invalid login attempt: {}", ex.getMessage());
        return new ResponseEntity<>(new ErrorDto("Invalid email or password"), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorDto> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        log.warn("Duplicate registration: {}", ex.getMessage());
        return new ResponseEntity<>(new ErrorDto(ex.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidRoleException.class)
    public ResponseEntity<ErrorDto> handleInvalidRole(InvalidRoleException ex) {
        return new ResponseEntity<>(new ErrorDto(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    //Event

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ErrorDto> handleEventNotFound(EventNotFoundException ex) {
        log.error("Event not found", ex);
        return new ResponseEntity<>(new ErrorDto("Event not found"), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EventUpdateException.class)
    public ResponseEntity<ErrorDto> handleEventUpdate(EventUpdateException ex) {
        log.error("Event update error", ex);
        return new ResponseEntity<>(new ErrorDto(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EventTicketException.class)
    public ResponseEntity<ErrorDto> handleEventTicket(EventTicketException ex) {
        log.warn("Event ticket constraint violation: {}", ex.getMessage());
        return new ResponseEntity<>(new ErrorDto(ex.getMessage()), HttpStatus.CONFLICT);
    }

    // Ticket

    @ExceptionHandler(TicketNotFoundException.class)
    public ResponseEntity<ErrorDto> handleTicketNotFound(TicketNotFoundException ex) {
        return new ResponseEntity<>(new ErrorDto("Ticket not found"), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TicketTypeNotFoundException.class)
    public ResponseEntity<ErrorDto> handleTicketTypeNotFound(TicketTypeNotFoundException ex) {
        return new ResponseEntity<>(new ErrorDto("Ticket type not found"), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(TicketsSoldOutException.class)
    public ResponseEntity<ErrorDto> handleTicketsSoldOut(TicketsSoldOutException ex) {
        return new ResponseEntity<>(new ErrorDto("Tickets sold out"), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InsufficientTicketsException.class)
    public ResponseEntity<ErrorDto> handleInsufficientTickets(InsufficientTicketsException ex) {
        return new ResponseEntity<>(new ErrorDto(ex.getMessage()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(TicketCancellationException.class)
    public ResponseEntity<ErrorDto> handleTicketCancellation(TicketCancellationException ex) {
        log.warn("Ticket cancellation rejected: {}", ex.getMessage());
        return new ResponseEntity<>(new ErrorDto(ex.getMessage()), HttpStatus.CONFLICT);
    }

    // QR Code

    @ExceptionHandler(QrCodeNotFoundException.class)
    public ResponseEntity<ErrorDto> handleQrCodeNotFound(QrCodeNotFoundException ex) {
        return new ResponseEntity<>(new ErrorDto("QR code not found or not active"), HttpStatus.NOT_FOUND);
    }

    // Payment

    @ExceptionHandler(PaymentVerificationException.class)
    public ResponseEntity<ErrorDto> handlePaymentVerification(PaymentVerificationException ex) {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(new ErrorDto(ex.getMessage()));
    }

    //RazorPay

    @ExceptionHandler(RazorpayException.class)
    public ResponseEntity<ErrorDto> handleRazorpay(RazorpayException ex) {
        log.error("Razorpay gateway error: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ErrorDto("Payment gateway error. Please try again."));
    }

    // User

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorDto> handleUserNotFound(UserNotFoundException ex) {
        return new ResponseEntity<>(new ErrorDto("User not found"), HttpStatus.NOT_FOUND);
    }

    // Validation

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDto> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        BindingResult result = ex.getBindingResult();
        List<FieldError> fieldErrors = result.getFieldErrors();
        String message = fieldErrors.stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse("Validation error");
        return new ResponseEntity<>(new ErrorDto(message), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorDto> handleConstraintViolation(ConstraintViolationException ex) {
        String message = ex.getConstraintViolations().stream()
                .findFirst()
                .map(cv -> cv.getPropertyPath() + ": " + cv.getMessage())
                .orElse("Constraint violation");
        return new ResponseEntity<>(new ErrorDto(message), HttpStatus.BAD_REQUEST);
    }

    // QR Code generation

    @ExceptionHandler(QrCodeGenerationException.class)
    public ResponseEntity<ErrorDto> handleQrCodeGeneration(QrCodeGenerationException ex) {
        log.error("QR code generation failed", ex);
        return new ResponseEntity<>(
                new ErrorDto("Failed to generate QR code. Please try again."),
                HttpStatus.INTERNAL_SERVER_ERROR);
    }

    //Fallback

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorDto> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return new ResponseEntity<>(
                new ErrorDto("An unexpected error occurred"), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
