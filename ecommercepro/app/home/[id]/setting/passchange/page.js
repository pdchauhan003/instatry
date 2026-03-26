'use client'
import { useRouter } from "next/router";
import { useParams } from "next/navigation";
function PassChange(){
    const router=useRouter();
    const {id}=useParams();
    const[oldpassword,setOldpassword]=useState('');
    const[password,setPassword]=useState('');
    const[confirmPass,setConfirmPass]=useSTate('')
    const handleChangePass=async()=>{
        const res=await fetch(`/api/auth/home/${id}/setting/passchange`,{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({oldpassword,password,confirmPass})
        })
    }
    return(
        <>
            <div>
                <input type="password" name="oldpassword" value={oldpassword} onChange={(e)=>setOldpassword(e.target.value)}
                placeholder="Enter oldpassword"/>
                <br/>
                <input type="password" name="password" value={password} onChange={(e)=>setPassword(e.target.value)}
                placeholder="Enter new password..."/>
                <input type="password" name="confirmPass" value={confirmPass} onChange={(e)=>setConfirmPass(e.target.value)}
                placeholder="Enter again new pass..."/>
                <input type="button" value='submit' onClick={handleChangePass}/>
            </div>
        </>
    )
}
export default PassChange;