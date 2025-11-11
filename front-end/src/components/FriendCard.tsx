import { useState } from "react";
import { Box, Typography, IconButton, Modal, Stack, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import type { User } from '../const'


interface Friend {
    friend: User;
}

const FriendCard: React.FC<Friend> = ({ friend }) => {
    const userProfImg = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';

    const [open, setOpen] = useState(false);

    const displayOptions = () => {
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleViewProfile = () => {
        alert("Function not implemented");
    };

    const handleUnfriend = () => {
        alert("Function not implemented");
    }

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 300,
                    height: 100,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: "#252061ff",
                    textAlign: 'center',
                    margin: 1, 
                    cursor: "pointer",
                    "&:hover": {
                        boxShadow: 6,
                        backgroundColor: '#484663ff',
                        transform: "scale(1.05)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    },
                }}>
                <Box
                    component="img"
                    src={userProfImg}
                    alt="User Profile"
                    sx={{
                        padding: 1,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        objectFit: 'cover',
                    }}
                />
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography sx={{
                        cursor: "pointer",
                        "&:hover": {
                            textDecoration: 'underline'
                        }
                    }}>{friend.username}</Typography>

                    <IconButton onClick={displayOptions}>
                        <MoreVertIcon />
                    </IconButton>
                </Box>
            </Box>

            {/* Modal */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "#2e2b52",
                        color: "white",
                        p: 4,
                        borderRadius: 3,
                        boxShadow: 24,
                        width: 300,
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {friend.username}
                    </Typography>
                    <Stack spacing={2}>
                        <Button variant="contained" color="primary" onClick={handleViewProfile}>
                            View Profile
                        </Button>
                        <Button variant="outlined" color="error" onClick={handleUnfriend}>
                            Unfriend
                        </Button>
                    </Stack>
                </Box>
            </Modal>
        </>

    );
};


export default FriendCard;