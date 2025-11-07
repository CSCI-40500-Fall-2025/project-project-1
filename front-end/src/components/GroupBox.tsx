import { Box, Typography } from "@mui/material";
import type { Group } from '../const'


interface GroupBoxProps {
    group: Group;
}


const GroupBox: React.FC<GroupBoxProps> = ({ group }) => {


    const handleClick = () => {
        alert("Function not implemented");
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