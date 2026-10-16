package co.com.codesa.shop.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @Column(length = 40)
    private String code;

    @Column(nullable = false)
    private Integer percent;

    @Column(nullable = false)
    private Long minSubtotal;

    private Long maxDiscount;

    private LocalDate expiresAt;
}
