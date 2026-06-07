package com.akshit.EventManagement.repositories;

import com.akshit.EventManagement.domain.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, String> {

}
