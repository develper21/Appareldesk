import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/order.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { Contact, ContactDocument } from '../contacts/contact.schema';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
    @InjectModel(Contact.name) private readonly contactModel: Model<ContactDocument>,
    private readonly paymentsService: PaymentsService,
  ) {}

  async getStats() {
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueAgg,
      monthOrders,
    ] = await Promise.all([
      this.orderModel.countDocuments({ status: { $ne: 'cancelled' } }),
      this.productModel.countDocuments(),
      this.contactModel.countDocuments({ contactType: 'customer' }),
      this.orderModel.aggregate<{ _id: null; total: number }>([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        status: { $ne: 'cancelled' },
      }),
    ]);

    return {
      totalRevenue: revenueAgg[0]?.total ?? 0,
      totalOrders,
      totalProducts,
      totalCustomers,
      ordersLast30Days: monthOrders,
    };
  }

  async getRecentOrders(limit = 5) {
    return this.orderModel
      .find({ status: { $ne: 'cancelled' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name')
      .populate('customerId', 'name')
      .exec();
  }

  async getTopProducts(limit = 5) {
    return this.orderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          quantity: { $sum: '$items.quantity' },
          amount: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { amount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$product.name',
          quantity: 1,
          amount: 1,
        },
      },
    ]);
  }

  async getMonthlySales() {
    return this.orderModel.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          sales: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          sales: 1,
          orders: 1,
        },
      },
    ]);
  }
}
