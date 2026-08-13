// Trang thông tin chi tiết từng sách
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import AdminNavbar from "../../components/AdminNavbar";

import { Author } from "../../data/authors";
import { Category } from "../../data/categories";
import { Publisher } from "../../data/publishers";
import { BookCopy } from "../../data/bookCopies";
import { Book } from "../../data/books";

import { BookCopyService } from "../../services/bookCopyService";
import bookService from "../../services/bookService";
import { AuthorService } from "../../services/authorService";
import { categoryService } from "../../services/categoryService";
import { publisherService } from "../../services/publisherService";

export default function BookDetail() {
    // State
    const [book, setBook] = useState<Book | undefined>();
    const [bookCopies, setBookCopies] = useState<BookCopy[]>([]);
    const [authors, setAuthors] = useState<Author[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [publishers, setPublishers] = useState<Publisher[]>([]);
    const [loading, setLoading] = useState(true);

    // Lấy bookId từ URL
    const { bookId } = useParams();
    const bookIdNumber = bookId ? parseInt(bookId) : NaN;

    // Load data
    useEffect(() => {
        const loadData = async () => {
            if (isNaN(bookIdNumber)) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Load book
                const bookData = await bookService.getById(bookIdNumber);
                setBook(bookData);

                // Load copies
                const copies = await BookCopyService.getByBookId(bookIdNumber);
                setBookCopies(copies);

                // Load authors, categories, publishers
                const [authorsData, categoriesData, publishersData] = await Promise.all([
                    AuthorService.getAll(),
                    categoryService.getAll(),
                    publisherService.getAll()
                ]);
                
                setAuthors(authorsData);
                setCategories(categoriesData);
                setPublishers(publishersData);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [bookIdNumber]);

    // Add copy
    const handleAddCopy = async () => {
        if (!book) return;

        try {
            const newCopy = await BookCopyService.create(book.id);
            setBookCopies((prev) => [...prev, newCopy]);
        } catch (error) {
            console.error(error);
            alert("Failed to create copy");
        }
    };

    // Delete copy
    const handleDeleteCopy = async (copyId: number) => {
        if (!window.confirm("Are you sure?")) return;

        try {
            await BookCopyService.delete(copyId);
            setBookCopies((prev) => prev.filter((c) => c.id !== copyId));
        } catch {
            alert("Failed to delete copy");
        }
    };

    // Invalid ID
    if (isNaN(bookIdNumber)) {
        return <div className="p-4 text-red-500">Invalid book ID</div>;
    }

    // Loading UI
    if (loading) {
        return (
            <>
                <AdminNavbar selected="books" />
                <div className="min-h-screen bg-purple-50 p-6 text-center">
                    <p className="text-purple-600">Loading book details...</p>
                </div>
            </>
        );
    }

    // Derived data
    const authorNames = book
        ? book.authorIds
            .map((id) => authors.find((a) => a.id === id)?.name || "Unknown")
            .join(", ")
        : "Unknown";

    const categoryNames = book
        ? book.categoryIds
            .map((id) => categories.find((c) => c.id === id)?.name || "Unknown")
            .join(", ")
        : "Unknown";

    const publisherName = book
        ? publishers.find((p) => p.id === book.publisherId)?.name || "Unknown"
        : "Unknown";

    const filteredCopies = book
        ? bookCopies.filter((c) => c.originalBookBookId === book.id)
        : [];

    return (
        <>
            <title>Book Detail</title>
            <AdminNavbar selected="books" />

            <div className="min-h-screen bg-purple-50 p-6">
                <h2 className="text-2xl font-bold text-purple-700 mb-4">
                    Book Detail
                </h2>

                {/* Book Info */}
                <div className="bg-white rounded shadow-md p-4 mb-4">
                    {book ? (
                        <>
                            <h3 className="text-xl font-semibold text-purple-800 mb-2">
                                {book.title}
                            </h3>
                            <p><strong>Authors:</strong> {authorNames}</p>
                            <p><strong>Categories:</strong> {categoryNames}</p>
                            <p><strong>Publisher:</strong> {publisherName}</p>
                            <p><strong>Description:</strong> {book.description}</p>
                        </>
                    ) : (
                        <p className="text-gray-500 italic">
                            Book information is not available.
                        </p>
                    )}
                </div>

                {/* Add copy */}
                <div className="flex justify-end mb-2">
                    <button
                        disabled={!book}
                        onClick={handleAddCopy}
                        className={`py-2 px-4 rounded text-white ${book
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        + Add New Copy
                    </button>
                </div>

                {/* Copies table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-2xl">
                    <table className="min-w-full text-center">
                        <thead className="bg-purple-100 text-purple-700">
                            <tr>
                                <th className="py-3 px-4">ID</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCopies.length > 0 ? (
                                filteredCopies.map((copy) => (
                                    <tr
                                        key={copy.id}
                                        className="border-t hover:bg-purple-50"
                                    >
                                        <td className="py-3 px-4">{copy.id}</td>
                                        <td
                                            className={`py-3 px-4 font-semibold ${copy.status === "AVAILABLE"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {copy.status}
                                        </td>
                                        <td className="py-3 px-4">
                                            <button
                                                onClick={() =>
                                                    handleDeleteCopy(copy.id)
                                                }
                                                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 text-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-6 text-gray-500"
                                    >
                                        No copies found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
