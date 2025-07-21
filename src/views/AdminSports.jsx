import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Container,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import {
  getAllSports,
  updateSportDetails,
  createSport,
  deleteSport,
} from "../services/adminAuthService";
import AdminLayout from "../components/AdminLayout";

const AdminSportsPage = () => {
  const [sports, setSports] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSport, setEditedSport] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newSport, setNewSport] = useState({
    name: "",
    noOfPlayer: "",
    sportType: "Group",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await getAllSports(token);
        setSports(res);
      } catch (err) {
        console.error("Error fetching sports:", err);
      }
    };
    fetchSports();
  }, [token]);

  const handleEditClick = (index) => {
    const selectedSport = sports[index];
    setEditingIndex(index);
    setEditedSport({
      id: selectedSport.sportId,
      name: selectedSport.name,
      noOfPlayer: selectedSport.noOfPlayer,
      sportType: selectedSport.sportType,
    });
  };

  const handleChange = (e) => {
    setEditedSport({
      ...editedSport,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await updateSportDetails(token, editedSport.id, editedSport);
      const updatedSports = [...sports];
      updatedSports[editingIndex] = {
        ...updatedSports[editingIndex],
        ...editedSport,
      };
      setSports(updatedSports);
      setEditingIndex(null);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDeleteSport = async (sportId) => {
    try {
      await deleteSport(token, sportId);
      const updatedList = sports.filter((s) => s.sportId !== sportId);
      setSports(updatedList);
      setEditingIndex(null);
    } catch (err) {
      console.error("Error deleting sport:", err);
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setNewSport({ name: "", noOfPlayer: "", sportType: "Group" });
  };

  const handleNewSportChange = (e) => {
    setNewSport({
      ...newSport,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveNewSport = async () => {
    try {
      const createdSport = await createSport(token, newSport);
      setSports([...sports, createdSport]);
      setIsAdding(false);
    } catch (err) {
      console.error("Error adding new sport:", err);
    }
  };

  const handleCancelNewSport = () => {
    setIsAdding(false);
    setNewSport({ name: "", noOfPlayer: "", sportType: "Group" });
  };

  return (
    <AdminLayout>
      <Container fluid className="p-4 text-white" style={{ backgroundColor: "#0a1120" }}>
        <Row>
          <Col>
            <h3>Sports in the system</h3>
            <br />
            <Button variant="primary" onClick={handleAddNew} className="mb-3">
              + Add New Sport
            </Button>

            <Table striped bordered hover variant="dark" className="mt-3 text-center">
              <thead>
                <tr>
                  <th>Sport Name</th>
                  <th>No. of Players</th>
                  <th>Sport Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAdding && (
                  <tr>
                    <td>
                      <Form.Control
                        type="text"
                        name="name"
                        value={newSport.name}
                        onChange={handleNewSportChange}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="noOfPlayer"
                        value={newSport.noOfPlayer}
                        onChange={handleNewSportChange}
                      />
                    </td>
                    <td>
                      <Form.Select
                        name="sportType"
                        value={newSport.sportType}
                        onChange={handleNewSportChange}
                      >
                        <option value="Group">Group</option>
                        <option value="Individual">Individual</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button variant="success" size="sm" onClick={handleSaveNewSport}>
                        Save
                      </Button>{" "}
                      <Button variant="secondary" size="sm" onClick={handleCancelNewSport}>
                        Cancel
                      </Button>
                    </td>
                  </tr>
                )}

                {sports.map((sport, index) => (
                  <tr key={sport.sportId}>
                    <td>
                      {editingIndex === index ? (
                        <Form.Control
                          type="text"
                          name="name"
                          value={editedSport.name || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        sport.name
                      )}
                    </td>
                    <td>
                      {editingIndex === index ? (
                        <Form.Control
                          type="number"
                          name="noOfPlayer"
                          value={editedSport.noOfPlayer || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        sport.noOfPlayer
                      )}
                    </td>
                    <td>
                      {editingIndex === index ? (
                        <Form.Select
                          name="sportType"
                          value={editedSport.sportType || ""}
                          onChange={handleChange}
                        >
                          <option value="Group">Group</option>
                          <option value="Individual">Individual</option>
                        </Form.Select>
                      ) : (
                        <Badge bg="danger">{sport.sportType}</Badge>
                      )}
                    </td>
                    <td>
                      {editingIndex === index ? (
                        <>
                          <Button variant="success" size="sm" onClick={handleSave}>
                            Save
                          </Button>{" "}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteSport(sport.sportId)}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEditClick(index)}
                        >
                          Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </AdminLayout>
  );
};

export default AdminSportsPage;
