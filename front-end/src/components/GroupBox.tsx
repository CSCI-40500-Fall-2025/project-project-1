import { Box, Typography, Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import type { Group } from "../const";

interface GroupBoxProps {
  group: Group;
}

const GroupBox = ({ group }: GroupBoxProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (group.group_id) {
      navigate(`/group/${group.group_id}`);
    }
  };

  return (
    <Box sx={{ textAlign: "center" }}>
      <Box
        onClick={handleClick}
        sx={{
          width: 200,
          height: 200,
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: "#252061ff",
          // backgroundImage: `url(${group.profileImg})`, when we want a img
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          textAlign: "center",
          alignItems: "center",
          gap: 1.5,
          padding: 2,
          cursor: "pointer",
          "&:hover": {
            boxShadow: 6,
            backgroundColor: "#484663ff",
            transform: "scale(1.05)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          },
        }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: "rgba(255, 255, 255, 0.2)",
            color: "white",
          }}
        >
          <GroupIcon sx={{ fontSize: 60 }} />
        </Avatar>
        <Typography
          variant="h6"
          sx={{
            color: "white",
            fontWeight: 600,
            fontSize: "1rem",
            textAlign: "center",
            wordBreak: "break-word",
            maxWidth: "100%",
          }}
        >
          {group.groupName}
        </Typography>
      </Box>
    </Box>
  );
};

export default GroupBox;
