import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { notification, List, Button } from 'antd';

const AnsweringApproval = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'answering_requests'));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRequests(data);
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
          ...(userRef.answeringPermissions || {}),
          [bookId]: true,
        },
      });

      notification.success({
        message: 'Approved',
        description: 'The answering request has been approved.',
      });

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
      await updateDoc(requestRef, { status: 'rejected' });

      notification.success({
        message: 'Rejected',
        description: 'The answering request has been rejected.',
      });

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
    <div>
      <h2>Answering Approvals</h2>
      {requests.length > 0 ? (
        <List
          dataSource={requests}
          renderItem={(request) => (
            <List.Item>
              <List.Item.Meta
                title={`${request.userName} requested to answer questions for Book ID: ${request.bookId}`}
                description={`Status: ${request.status || 'pending'}`}
              />
              <Button
                type="primary"
                onClick={() => handleApprove(request.id, request.userId, request.bookId)}
              >
                Approve
              </Button>
              <Button
                danger
                style={{ marginLeft: '10px' }}
                onClick={() => handleReject(request.id)}
              >
                Reject
              </Button>
            </List.Item>
          )}
        />
      ) : (
        <p>No answering requests available.</p>
      )}
    </div>
  );
};

export default AnsweringApproval;
