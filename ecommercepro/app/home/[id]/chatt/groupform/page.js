'use client'

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, UserMinus, ArrowLeft, Users, Check, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { searchApi } from "@/handler/SearchApi";
import { toast } from "react-hot-toast";


export default function CreateGroup() {
    const { id } = useParams();
    const router = useRouter();
    const [groupName, setGroupName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [messageUsers,setMessageUsers]=useState([]);

    // Fetch users based on search term
    useEffect(() => {
        const fetchData=async()=>{
            try{
            const res=await fetch(`/api/auth/home/${id}/chatt/groupform`,{
                method:'POST',
                headers:{'Content-Type':'application/json'}
            })
            const data=await res.json();
            console.log('data in oage is groupform:',data)
            setMessageUsers(data)
            }
            catch(error){
                console.log('alert to fetch data of groupform')
            }
        }
        fetchData();
        const fetchUsers = async () => {
            if (!searchTerm.trim()) {
                setUsers([]);
                return;
            }
            setLoading(true);
            try {
                const data = await searchApi(id, searchTerm);
                if (data.success) {
                    setUsers(data.users || []);
                }
            } catch (error) {
                console.error("Error searching users:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, id]);

    const handleToggleUser = (user) => {
        const isAdded = selectedUsers.some((u) => u.username === user.username);

        if (isAdded) {
            setSelectedUsers(selectedUsers.filter((u) => u.username !== user.username));
        } else {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const isFormValid = groupName.trim().length > 0 && selectedUsers.length > 0;

    const handleCreateGroup=async()=>{
        try{
        const selectedUserIds = selectedUsers.map(u => u._id);
        const res = await fetch(`/api/auth/home/${id}/chatt/groupform/creategroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                selectedUser: selectedUserIds, 
                groupName 
            })
        })
        const data=await res.json();
        if(data.success){
            toast.success('group created successfully')
            router.replace(`/home/${id}/chatt`);
        }
        else{
            toast.error('group created failed')
        }
        }
        catch(error){
            console.log('error in handling create group for page side')
        }

    }
    console.log('selected users data is',selectedUsers)
    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button 
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        New Group
                    </h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Group Details Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-6 shadow-2xl">
                    <div className="space-y-6">
                        {/* Group Name Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                Group Name
                            </label>
                            <div className="relative group">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Weekend Warriors"
                                    value={groupName}
                                    onChange={(e) => setGroupName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-lg"
                                />
                            </div>
                        </div>

                        {/* User Search */}
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-1">
                                Add Members
                            </label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                />
                                {loading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Selected Users Chips */}
                <AnimatePresence>
                    {selectedUsers.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2 p-2">
                                {selectedUsers.map((user) => (
                                    <motion.div
                                        key={user.username}
                                        layout
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.8, opacity: 0 }}
                                        className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded-full text-sm"
                                    >
                                        <div className="relative w-5 h-5 rounded-full overflow-hidden">
                                            <Image 
                                                src={user.image || "/default-avatar.png"} 
                                                alt={user.username} 
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span>{user.username}</span>
                                        <button onClick={() => handleToggleUser(user)} className="hover:text-white">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Users List */}
                <div className="space-y-3 min-h-[300px]">
                    <AnimatePresence mode="popLayout">
                        {messageUsers.map((user) => {
                            const isAdded = selectedUsers.some((u) => u.username === user.username);
                            return (
                                <motion.div
                                    key={user.username}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-purple-500/50 transition-colors">
                                            <Image 
                                                src={user.image || "/default-avatar.png"} 
                                                alt={user.username} 
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-semibold">{user.username}</p>
                                            <p className="text-xs text-gray-500">Member</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => handleToggleUser(user)}
                                        variant={isAdded ? "destructive" : "secondary"}
                                        size="sm"
                                        className={`rounded-xl px-4 font-bold transition-all ${isAdded ? 'bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white' : 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/20'}`}
                                    >
                                        {isAdded ? (
                                            <><UserMinus className="w-4 h-4 mr-1.5" /> Remove</>
                                        ) : (
                                            <><UserPlus className="w-4 h-4 mr-1.5" /> Add</>
                                        )}
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {users.length === 0 && !loading && searchTerm && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>No users found matching {searchTerm}</p>
                        </div>
                    )}

                    {users.length === 0 && !searchTerm && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <Users className="w-12 h-12 mb-4 opacity-20" />
                            <p>Search for users to add to your group</p>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <motion.div 
                    className="fixed bottom-8 px-10 md:px-8 pointer-events-none"
                    initial={{ y: 100 }}
                    animate={{ y: isFormValid ? 0 : 100 }}
                >
                    <div className="max-w-2xl mx-auto pointer-events-auto" onClick={handleCreateGroup}>
                        <Button 
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg shadow-2xl shadow-purple-500/40 border-none group transition-all"
                            disabled={!isFormValid}
                        >
                            <span>Create Group</span>
                            {/* <Check className="w-5 h-5 ml-2 group-hover:scale-125 transition-transform" /> */}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
