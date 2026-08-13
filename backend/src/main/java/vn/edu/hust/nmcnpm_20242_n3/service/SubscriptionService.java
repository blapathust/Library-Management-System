package vn.edu.hust.nmcnpm_20242_n3.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import vn.edu.hust.nmcnpm_20242_n3.entity.Book;
import vn.edu.hust.nmcnpm_20242_n3.entity.BookCopy;
import vn.edu.hust.nmcnpm_20242_n3.entity.Subscription;
import vn.edu.hust.nmcnpm_20242_n3.repository.BookRepository;
import vn.edu.hust.nmcnpm_20242_n3.repository.BookCopyRepository;
import vn.edu.hust.nmcnpm_20242_n3.repository.SubscriptionRepository;
import vn.edu.hust.nmcnpm_20242_n3.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {

    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final JavaMailSender emailSender;

    @Autowired

    public SubscriptionService(BookCopyRepository bookCopyRepository, BookRepository bookRepository, SubscriptionRepository subscriptionRepository,
                               UserRepository userRepository, JavaMailSender emailSender) {
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.emailSender = emailSender;
    }

    public void subscribeToBook(int bookId, String userId) {
        // Check if the book exists
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));

        // Check for existing active subscription
        Optional<Subscription> existing = subscriptionRepository.findByBook_BookIdAndUserId(bookId, userId);
        if (existing.isPresent() && existing.get().isActive()) {
            throw new IllegalArgumentException("You are already subscribed to this book");
        }

        // Reactivate if inactive, otherwise create new
        if (existing.isPresent()) {
            Subscription sub = existing.get();
            sub.setActive(true);
            subscriptionRepository.save(sub);
            return;
        }

        // Create a new subscription
        Subscription subscription = new Subscription();
        subscription.setBook(book);
        subscription.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
        subscription.setActive(true);

        // Save the subscription
        subscriptionRepository.save(subscription);
    }

    public void unsubscribeFromBook(Integer subscriptionId) {
        // Find the subscription
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));

        // Mark the subscription as inactive
        subscription.setActive(false);
        subscriptionRepository.save(subscription);
    }

    public void cancelSubscriptionAfterBorrowing(int bookId, String userId) {
        Subscription subscription = subscriptionRepository.findByBook_BookIdAndUserId(bookId, userId)
                .orElse(null);

        if (subscription != null) {
            subscription.setActive(false);
            subscriptionRepository.save(subscription);
        }
    }

    public void notifyAllUsers() {
        // Lấy tất cả các đăng ký đang hoạt động
        List<Subscription> subscriptions = subscriptionRepository.findAllByActive(true);

        // Gửi thông báo cho từng người dùng nếu sách có bản sao khả dụng
        for (Subscription subscription : subscriptions) {
            Book book = subscription.getBook();
            boolean hasAvailableCopy = bookCopyRepository.findByOriginalBook_BookId(book.getBookId()).stream()
                    .anyMatch(copy -> copy.getStatus().equals(vn.edu.hust.nmcnpm_20242_n3.constant.BookCopyStatusEnum.AVAILABLE));

            if (hasAvailableCopy) {
                String email = subscription.getUser().getEmail();
                System.out.println("Notification sent to: " + email);
                this.sendEmail(email,
                        "The book you subscribed to is now available. Book Title: "
                                + book.getTitle());
            }
        }
    }

    public void notifyUsersByBook(int bookId) {
        // Lấy tất cả các đăng ký cho sách cụ thể
        List<Subscription> subscriptions = subscriptionRepository.findAllByBook_BookIdAndActive(bookId, true);

        if (subscriptions.isEmpty()) {
            System.out.println("No subscriptions found for book with ID: " + bookId);
            return;
        }

        // Gửi thông báo cho từng người dùng
        for (Subscription subscription : subscriptions) {
            String email = subscription.getUser().getEmail();
            System.out.println("Notification sent to: " + email);
            this.sendEmail(email,
                    "The book you subscribed to is now available. Book Title: "
                            + subscription.getBook().getTitle());
        }
    }

    private void sendEmail(String to, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Book Copy Available");
            message.setText(body);
            emailSender.send(message);
            System.out.println("Email sent to: " + to);
        } catch (Exception e) {
            System.err.println("Error sending email to " + to + ": " + e.getMessage());
        }
    }

    public List<Subscription> getUserSubscriptions(String userId) {
        return subscriptionRepository.findAllByUserId(userId);
    }

    @Scheduled(cron = "0 0 4 * * ?")
    public void notifyUsersAutomatically() {
        this.notifyAllUsers();
    }
}

