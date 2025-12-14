import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { Group } from '../const'


interface GroupBoxProps {
    group: Group;
}

const GroupBox = ({ group } : GroupBoxProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (group.group_id) {
            navigate(`/group/${group.group_id}`);
        }
    };


    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box
                onClick={handleClick}
                sx={{
                    width: 200,
                    height: 200,
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: "#252061ff",
                    // backgroundImage: `url(${group.profileImg})`, when we want a img
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center',
                    alignItems: 'center',
                    cursor: "pointer",
                    "&:hover": {
                        boxShadow: 6,
                        backgroundColor: '#484663ff',
                        transform: "scale(1.05)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease"
                    },
                }}
            >
            </Box>
            <Typography>{group.groupName}</Typography>
        </Box>
    );
};


export default GroupBox;