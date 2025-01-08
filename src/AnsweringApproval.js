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
import './AnsweringApproval.css';

const AnsweringApproval = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Only fetch requests where status == 'pending'
        const colRef = collection(db, 'answering_requests');
        const pendingQuery = query(colRef, where('status', '==', 'pending'));
        const querySnapshot = await getDocs(pendingQuery);

        // For each request doc, fetch the book's title (if needed)
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
        console.error('Error fetching answering requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleApprove = async (requestId, userId, bookId) => {
    try {
      const requestRef = doc(db, 'answering_requests', requestId);
      await updateDoc(requestRef, { status: 'approved' });

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        answeringPermissions: {
          // Safely merge old permissions if they exist
          ...(userRef.answeringPermissions || {}),
          [bookId]: true,
        },
      });

      notification.success({
        message: 'Approved',
        description: 'The answering request has been approved.',
      });

      // Remove this request from local state so it disappears immediately
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error('Error approving request:', error);
      notification.error({
        message: 'Approval Failed',
        description: 'There was an error approving the request.',
      });
    }
  };

  const handleReject = async (requestId) => {
    try {
      const requestRef = doc(db, 'answering_requests', requestId);
      // Delete it from Firestore if rejected
      await deleteDoc(requestRef);

      notification.success({
        message: 'Rejected',
        description: 'The answering request has been rejected & removed.',
      });

      // Remove from state
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error('Error rejecting request:', error);
      notification.error({
        message: 'Rejection Failed',
        description: 'There was an error rejecting the request.',
      });
    }
  };

  return (
    <div className="page-container">
      <div className="approval-container">
        <div className="approval-header">
          <h2>Answering Approvals</h2>
          <p className="header-description">
            Manage user requests to answer questions for books
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
                          This user has requested permission to answer questions
                          for the specified book.
                        </p>
                        <div className="request-meta">
                          <span className="meta-item">
                            <i className="meta-icon calendar" />
                            {/* Safely handle if request.timestamp is missing */}
                            {request.timestamp?.toDate
                              ? new Date(
                                  request.timestamp.toDate()
                                ).toLocaleDateString()
                              : 'No Date'}
                          </span>
                        </div>
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
            <p>There are currently no answering requests.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnsweringApproval;
