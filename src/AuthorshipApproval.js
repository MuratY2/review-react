import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { notification, List, Button } from 'antd';
import './AuthorshipApproval.css'; // You can create a similar CSS file or reuse styling

const AuthorshipApproval = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Only fetch requests where status == 'pending'
        const colRef = collection(db, 'authorship_requests');
        const pendingQuery = query(colRef, where('status', '==', 'pending'));
        const querySnapshot = await getDocs(pendingQuery);

        // For each request doc, fetch the book's title
        const requestData = await Promise.all(
          querySnapshot.docs.map(async (docSnapshot) => {
            const reqData = docSnapshot.data();
            let bookTitle = '';

            if (reqData.bookId) {
              const bookRef = doc(db, 'books_pending', reqData.bookId);
              const bookSnap = await getDoc(bookRef);
              if (bookSnap.exists()) {
                const bookData = bookSnap.data();
                bookTitle = bookData.title || '';
              }
            }

            return {
              id: docSnapshot.id,
              ...reqData,
              bookTitle
            };
          })
        );

        setRequests(requestData);
      } catch (error) {
        console.error('Error fetching authorship requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (requestId, userId, bookId) => {
    try {
      // 1. Update the authorship_requests document status to 'approved'
      const requestRef = doc(db, 'authorship_requests', requestId);
      await updateDoc(requestRef, { status: 'approved' });

      // 2. Set linkedAuthorId in the corresponding book document
      const bookRef = doc(db, 'books_pending', bookId);
      await updateDoc(bookRef, { linkedAuthorId: userId });

      notification.success({
        message: 'Approved',
        description: 'The authorship request has been approved. Book is now linked to this author.',
      });

      // Remove this request from local state so it disappears immediately
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error('Error approving authorship request:', error);
      notification.error({
        message: 'Approval Failed',
        description: 'There was an error approving the authorship request.',
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      // If rejected, you can either update status to 'rejected' or just delete the doc
      const requestRef = doc(db, 'authorship_requests', requestId);
      await deleteDoc(requestRef);

      notification.success({
        message: 'Rejected',
        description: 'The authorship request has been rejected & removed.',
      });

      // Remove from state
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error('Error rejecting authorship request:', error);
      notification.error({
        message: 'Rejection Failed',
        description: 'There was an error rejecting the authorship request.',
      });
    }
  };

  return (
    <div className="page-container">
      <div className="approval-container">
        <div className="approval-header">
          <h2>Authorship Approvals</h2>
          <p className="header-description">
            Manage requests from authors to officially claim their books.
          </p>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-value">{requests.length}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
          </div>
        </div>

        {requests.length > 0 ? (
          <div className="requests-section">
            <List
              className="request-list"
              dataSource={requests}
              renderItem={(request) => (
                <List.Item className="list-item">
                  <div className="request-content">
                    <div className="request-header">
                      <div className="user-info">
                        <span className="user-avatar">
                          {request.userName?.charAt(0).toUpperCase()}
                        </span>
                        <div className="user-details">
                          <h3 className="user-name">{request.userName}</h3>
                          <span className="book-id">
                            Book ID: {request.bookId}
                          </span>
                          {request.bookTitle && (
                            <span className="book-title">
                              Book Title: {request.bookTitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`status-badge status-${
                          request.status || 'pending'
                        }`}
                      >
                        {request.status || 'pending'}
                      </div>
                    </div>

                    <div className="request-body">
                      <div className="request-info">
                        <p className="request-description">
                          This user has requested to be recognized as the
                          official author of the specified book.
                        </p>
                      </div>
                    </div>

                    <div className="action-buttons">
                      <Button
                        type="primary"
                        className="approve-button"
                        onClick={() =>
                          handleApprove(request.id, request.userId, request.bookId)
                        }
                      >
                        ✓ Approve
                      </Button>
                      <Button
                        className="reject-button"
                        onClick={() => handleReject(request.id)}
                      >
                        × Reject
                      </Button>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📫</div>
            <h3>No Pending Requests</h3>
            <p>There are currently no authorship requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorshipApproval;
