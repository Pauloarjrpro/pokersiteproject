import { useEffect, useState } from "react";
import { Button, Drawer, IconButton, TextField } from "@mui/material";
import EmojiPicker, {
    Emoji,
} from "emoji-picker-react";
import { Icon } from "@iconify/react";


export default function EmojiPickerDrawer({ open, onSelected, onClose }) {

    const [selectedEmoji, setSelectedEmoji] = useState("");
    const [message, setMessage] = useState('');

    const onClick = (emojiData, event) => {
        setSelectedEmoji(emojiData.unified);

    }
    useEffect(() => {
        setSelectedEmoji("");
        setMessage('');
    }, [open])
    return (
        <Drawer open={open} onClose={onClose} anchor={'left'} >
            <div className="w-full h-full bg-white flex flex-col justify-between" >

                <EmojiPicker onEmojiClick={onClick} autoFocusSearch={false}
                    searchDisabled previewConfig={{ showPreview: false }}
                    className={'flex-1'}
                    height={'100%'}

                >

                </EmojiPicker>
                <div className='flex gap-2 items-center p-1 py-2'>
                    <div className = {'w-8 h-8'}>
                        <Emoji unified={selectedEmoji}></Emoji>
                    </div>

                    <TextField onKeyDown={(e)=>{
                        if(e?.key?.toLocaleLowerCase()==="enter"){
                            e.preventDefault();
                            onSelected(selectedEmoji, message); 
                            onClose(); 
                        }
                    }}  className="flex-1" variant="standard" placeholder="Allow 24 characters" value={message} onChange={(e) => { setMessage(e.target.value) }} sx={{ input: { color: 'black' } }} inputProps={{ maxLength: 24 }}>

                    </TextField>
                    <IconButton onClick={() => { onSelected(selectedEmoji, message); onClose(); }}>
                        <Icon icon={'cib:telegram-plane'} color={'red'}></Icon>
                    </IconButton>
                </div>
            </div>


        </Drawer>
    )
}