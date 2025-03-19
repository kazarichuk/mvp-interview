"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader
} from "@/components/ui/card"
import { 
  Badge
} from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { 
  Check, 
  UserPlus, 
  Zap, 
  Calendar, 
  Shield, 
  AlertCircle, 
  BadgeCheck,
  Users,
  LineChart,
  Star,
  Clock,
  Briefcase
} from 'lucide-react'
import { auth } from '@/lib/firebase/config'
import { cn } from '@/lib/utils'

interface InviteButtonProps {
  position?: string
}

export const InviteButton: React.FC<InviteButtonProps> = ({ 
  position = 'UX/UI Designer' 
}) => {
  const [open, setOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userEmail = auth.currentUser?.email || ''

  const handleSubmit = () => {
    setIsSubmitting(true)
    
    // Open email client with pre-filled details
    const subject = encodeURIComponent(`Enterprise Plan Request for ${position} Position`)
    const body = encodeURIComponent(
      `Hello,

I'd like to upgrade to the ${selectedPlan === 'yearly' ? 'Premium Annual' : 'Professional Monthly'} Plan for unlimited candidate invites.

Position: ${position}
Account Email: ${userEmail}
Selected Plan: ${selectedPlan === 'yearly' ? 'Premium Annual ($9/month billed yearly)' : 'Professional Monthly ($30/month)'}

Please send me payment information to complete my subscription.

Thank you!`
    )
    
    window.location.href = `mailto:kazarichuk@gmail.com?subject=${subject}&body=${body}`
    
    // Close dialog after short delay
    setTimeout(() => {
      setIsSubmitting(false)
      setOpen(false)
    }, 500)
  }

  const plans = [
    {
      type: 'monthly' as const,
      name: 'Professional',
      price: 30,
      savings: 0,
      billingFrequency: 'per month',
      description: 'Perfect for small hiring teams with regular recruitment needs',
      features: [
        { text: 'Unlimited candidate invites', icon: <Users className="h-4 w-4 text-primary" /> },
        { text: 'AI-powered candidate assessments', icon: <Briefcase className="h-4 w-4 text-primary" /> },
        { text: 'Comprehensive skill reports', icon: <LineChart className="h-4 w-4 text-primary" /> },
        { text: 'Standard email support', icon: <Clock className="h-4 w-4 text-primary" /> }
      ]
    },
    {
      type: 'yearly' as const,
      name: 'Premium',
      price: 9,
      savings: 70,
      billingFrequency: 'per month, billed annually',
      description: 'Best value for companies with ongoing hiring campaigns',
      popular: true,
      features: [
        { text: 'Everything in Professional plan', icon: <BadgeCheck className="h-4 w-4 text-primary" /> },
        { text: 'Priority support (24hr response)', icon: <Star className="h-4 w-4 text-primary" /> },
        { text: 'Advanced analytics dashboard', icon: <LineChart className="h-4 w-4 text-primary" /> },
        { text: 'CSV/Excel candidate bulk import', icon: <Users className="h-4 w-4 text-primary" /> }
      ]
    }
  ]

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="flex items-center h-10"
        size="default"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Share Link
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Scale Your Hiring Process
            </DialogTitle>
            <DialogDescription className="text-base">
              Unlock premium features to find the perfect {position} candidates faster
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 px-6 pb-6">
            {plans.map((plan) => (
              <Card 
                key={plan.type} 
                className={cn(
                  "cursor-pointer hover:shadow-md transition-all relative overflow-hidden",
                  selectedPlan === plan.type && "border-primary shadow-sm"
                )}
                onClick={() => setSelectedPlan(plan.type)}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">
                      {plan.name}
                    </h3>
                    {plan.savings > 0 && (
                      <Badge variant="secondary" className="bg-green-100 hover:bg-green-100 text-green-800">
                        SAVE {plan.savings}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm">
                      {plan.billingFrequency}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm">
                        <div className="flex-shrink-0 mt-0.5">{feature.icon}</div>
                        <span>{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  {selectedPlan === plan.type ? (
                    <div className="w-full flex items-center justify-center text-primary font-medium py-1">
                      <Check className="mr-2 h-4 w-4" />
                      Selected
                    </div>
                  ) : (
                    <div className="w-full text-muted-foreground text-center py-1 text-sm">
                      Click to select
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="px-6 py-4">
            <DialogFooter className="flex justify-center gap-3 flex-col">
              <div className="flex justify-center gap-6 mb-3 w-full">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">Activate instantly</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Flexible cancellation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Secure transactions</span>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                size="lg"
                className="px-10"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Upgrade Now'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default InviteButton