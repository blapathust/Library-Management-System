// Component nay dùng để hiển thị thông tin của một cuốn sách trong trang quản lý
import { useState, useEffect } from "react";
import { Book as BookType } from "../data/books";
import { Author as AuthorType } from "../data/authors";
import { Category as CategoryType } from "../data/categories";
import { Publisher as PublisherType } from "../data/publishers";
import { AuthorService } from "../services/authorService";
import { categoryService } from "../services/categoryService";
import { publisherService } from "../services/publisherService";

// Props nhận từ component cha
interface AdminBookProps {
    book: BookType;             // Thông tin của cuốn sách cần hiển thị
    onView: () => void;         // Hàm xử lý khi nhấn nút View
    onEdit: () => void;         // Hàm xử lý khi nhấn nút Edit
    onDelete: () => void;       // Hàm xử lý khi nhấn nút Delete
}

export default function AdminBook({ book, onView, onEdit, onDelete }: AdminBookProps) {
    // State for storing data from localStorage
    const [authors, setAuthors] = useState<AuthorType[]>([]);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [publishers, setPublishers] = useState<PublisherType[]>([]);
    
    // Load data from API on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [authorsData, categoriesData, publishersData] = await Promise.all([
                    AuthorService.getAll(),
                    categoryService.getAll(),
                    publisherService.getAll()
                ]);
                setAuthors(authorsData);
                setCategories(categoriesData);
                setPublishers(publishersData);
            } catch (error) {
                console.error("Failed to load metadata for AdminBook", error);
            }
        };
        loadData();
    }, []);
    
    // Tìm tên tác giả từ danh sách id
    const authorNames = book.authorIds
        .map((id) => authors.find((a) => a.id === id)?.name || "Unknown")
        .join(", ");

    // Tìm tên thể loại từ danh sách id
    const categoryNames = book.categoryIds
        .map((id) => categories.find((c) => c.id === id)?.name || "Unknown")
        .join(", ");

    // Tìm tên nhà xuất bản từ id
    const publisherName =
        publishers.find((p) => p.id === book.publisherId)?.name || "Unknown";

    return (
        <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between h-full">
            <div>
                {/* Tiêu đề sách */}
                <h3 className="text-lg font-semibold text-purple-700 mb-2">{book.title}</h3>

                {/* Tác giả */}
                <p className="text-sm text-gray-700">
                    <strong className="text-purple-700">Authors:</strong> {authorNames}
                </p>

                {/* Thể loại */}
                <p className="text-sm text-gray-700">
                    <strong className="text-purple-700">Categories:</strong> {categoryNames}
                </p>

                {/* Nhà xuất bản */}
                <p className="text-sm text-gray-700">
                    <strong className="text-purple-700">Publisher:</strong> {publisherName}
                </p>
            </div>

            {/* Các nút thao tác */}
            <div className="mt-4 flex space-x-2">
                <button onClick={onView} className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">View</button>
                <button onClick={onEdit} className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600">Edit</button>
                <button onClick={onDelete} className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Delete</button>
            </div>
        </div>
    );
}
